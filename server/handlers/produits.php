<?php

require_once __DIR__ . '/utils.php';

function handleProduits($pdo, $method, $id, $input, $user = null) {

    // Log pour débogage (supprime après test)
    error_log("handleProduits | Méthode: $method | ID reçu: " . var_export($id, true));
    if (in_array($method, ['POST', 'PUT', 'DELETE']) && $user && isset($user['nom'])) {
        $safe_nom = $pdo->quote($user['nom']);
        $pdo->exec("SET LOCAL app.current_user = $safe_nom;");
    }

    switch ($method) {
        case 'GET':
            if ($id !== null && $id !== '') {
                $stmt = $pdo->prepare("SELECT id, n_produit, design, stock FROM produit WHERE id = ?");
                $stmt->execute([$id]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $data ? respond($data) : error("Produit non trouvé", 404);
            } else {
                $stmt = $pdo->query("SELECT id, n_produit, design, stock FROM produit ORDER BY n_produit");
                respond($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
            break;

        case 'POST':
            if (empty($input['n_produit']) || empty($input['design'])) {
                error("n_produit et design requis");
            }
            $stmt = $pdo->prepare("
                INSERT INTO produit (n_produit, design, stock) 
                VALUES (?, ?, ?) 
                RETURNING id, n_produit, design, stock
            ");
            try {
                $stmt->execute([
                    (int)$input['n_produit'],
                    $input['design'],
                    $input['stock'] ?? 0
                ]);
                $newProduit = $stmt->fetch(PDO::FETCH_ASSOC);
                respond([
                    'message' => 'Produit créé',
                    'produit' => $newProduit
                ], 201);
            } catch (PDOException $e) {
                error("Erreur création (doublon n_produit ?) : " . $e->getMessage(), 400);
            }
            break;

        case 'PUT':
            if ($id === null || $id === '') {
                error("id requis dans l'URL (exemple : /produits/5)", 400);
            }
            if (empty($input['design']) && !isset($input['stock'])) {
                error("Au moins design ou stock requis");
            }

            $fields = [];
            $values = [];
            if (isset($input['design'])) {
                $fields[] = "design = ?";
                $values[] = $input['design'];
            }
            if (isset($input['stock'])) {
                $fields[] = "stock = ?";
                $values[] = $input['stock'];
            }
            if (empty($fields)) {
                error("Aucun champ à modifier");
            }

            $values[] = (int)$id;
            $sql = "UPDATE produit SET " . implode(', ', $fields) . " WHERE id = ? RETURNING id, n_produit, design, stock";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            if ($stmt->rowCount() === 0) {
                error("Produit non trouvé ou aucun changement", 404);
            }

            $updated = $stmt->fetch(PDO::FETCH_ASSOC);
            respond([
                'message' => 'Produit mis à jour',
                'produit' => $updated
            ]);
            break;

        case 'DELETE':
            if ($id === null || $id === '') {
                error("id requis dans l'URL (exemple : /produits/5)", 400);
            }
            $stmt = $pdo->prepare("DELETE FROM produit WHERE id = ?");
            $stmt->execute([(int)$id]);
            if ($stmt->rowCount() === 0) {
                error("Produit non trouvé", 404);
            }
            respond(['message' => 'Produit supprimé']);
            break;

        default:
            error("Méthode non autorisée", 405);
    }
}