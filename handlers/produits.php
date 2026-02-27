
<?php
require_once __DIR__ . '/utils.php';
function handleProduits($pdo, $method, $id, $input) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM produit WHERE n_produit = ?");
                $stmt->execute([$id]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
                $data ? respond($data) : error("Produit non trouvé", 404);
            } else {
                $stmt = $pdo->query("SELECT * FROM produit ORDER BY n_produit");
                respond($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
            break;

        case 'POST':
            if (empty($input['n_produit']) || empty($input['design'])) {
                error("n_produit et design requis");
            }
            $stmt = $pdo->prepare("INSERT INTO produit (n_produit, design, stock) VALUES (?, ?, ?)");
            $stmt->execute([$input['n_produit'], $input['design'], $input['stock'] ?? 0]);
            respond(['message' => 'Produit créé', 'n_produit' => $input['n_produit']], 201);
            break;


        case 'PUT':
            if (!$id) error("ID requis pour modification", 400);
            if (empty($input['design']) && !isset($input['stock'])) {
                error("Au moins un champ (design ou stock) requis");
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
            $values[] = $id;
            $sql = "UPDATE produit SET " . implode(', ', $fields) . " WHERE n_produit = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);
            if ($stmt->rowCount() === 0) {
                error("Produit non trouvé ou aucun changement", 404);
            }
            respond(['message' => 'Produit mis à jour']);
            break;

        case 'DELETE':
            if (!$id) error("ID requis pour suppression", 400);
            $stmt = $pdo->prepare("DELETE FROM produit WHERE n_produit = ?");
            $stmt->execute([$id]);
            if ($stmt->rowCount() === 0) {
                error("Produit non trouvé", 404);
            }
            respond(['message' => 'Produit supprimé']);
            break;

    }
}


