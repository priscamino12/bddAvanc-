<?php

require_once __DIR__ . '/utils.php';

function handleFournisseurs($pdo, $method, $id, $input) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare("SELECT id, n_frs, nom FROM fournisseur WHERE id = ?");
                $stmt->execute([$id]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $data ? respond($data) : error("Fournisseur non trouvé", 404);
            } else {
                $stmt = $pdo->query("SELECT id, n_frs, nom FROM fournisseur ORDER BY n_frs");
                respond($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
            break;

        case 'POST':
            if (empty($input['n_frs']) || empty($input['nom'])) {
                error("Les champs 'n_frs' et 'nom' sont requis");
            }
            $stmt = $pdo->prepare("
                INSERT INTO fournisseur (n_frs, nom) 
                VALUES (?, ?) 
                RETURNING n_frs, nom
            ");
            try {
                $stmt->execute([
                    (int)$input['n_frs'],
                    $input['nom']
                ]);

                $newFrs = $stmt->fetch(PDO::FETCH_ASSOC);

                respond([
                    'message' => 'Fournisseur créé',
                    'fournisseur' => $newFrs
                ], 201);

            } catch (PDOException $e) {
                error("Erreur création : " . $e->getMessage(), 400);
            }
        break;


        case 'PUT':
            if ($id === null || $id === '') {
                error("id requis dans l'URL (exemple : /fournisseurs/5)", 400);
            }
            if (empty($input['n_frs']) && !isset($input['nom'])) {
                error("Au moins n_frs ou nom requis");
            }

            $fields = [];
            $values = [];
            if (isset($input['n_frs'])) {
                $fields[] = "n_frs = ?";
                $values[] = $input['n_frs'];
            }
            if (isset($input['nom'])) {
                $fields[] = "nom = ?";
                $values[] = $input['nom'];
            }
            if (empty($fields)) {
                error("Aucun champ à modifier");
            }

            $values[] = (int)$id;
            $sql = "UPDATE fournisseur SET " . implode(', ', $fields) . " WHERE id = ? RETURNING id, n_frs, nom";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            if ($stmt->rowCount() === 0) {
                error("Fournisseur non trouvé ou aucun changement", 404);
            }

            $updated = $stmt->fetch(PDO::FETCH_ASSOC);
            respond([
                'message' => 'Fournisseur mis à jour',
                'fournisseur' => $updated
            ]);
            break;

        case 'DELETE':
            if ($id === null || $id === '') {
                error("id requis dans l'URL (exemple : /fournisseurs/5)", 400);
            }
            $stmt = $pdo->prepare("DELETE FROM fournisseur WHERE id = ?");
            $stmt->execute([(int)$id]);
            if ($stmt->rowCount() === 0) {
                error("Fournisseur non trouvé", 404);
            }
            respond(['message' => 'Fournisseur supprimé']);
            break;

        default:
            error("Méthode non autorisée sur /fournisseurs", 405);
    }
}