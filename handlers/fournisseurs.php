<?php

require_once __DIR__ . '/utils.php';

function handleFournisseurs($pdo, $method, $id, $input) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM fournisseur WHERE n_frs = ?");
                $stmt->execute([$id]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $data ? respond($data) : error("Fournisseur non trouvé", 404);
            } else {
                $stmt = $pdo->query("SELECT * FROM fournisseur ORDER BY n_frs");
                respond($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
            break;

        case 'POST':
            if (empty($input['nom'])) {
                error("Le champ 'nom' est requis");
            }
            $stmt = $pdo->prepare("
                INSERT INTO fournisseur (nom) 
                VALUES (?) 
                RETURNING n_frs
            ");
            $stmt->execute([$input['nom']]);
            $newId = $stmt->fetchColumn();
            respond(['message' => 'Fournisseur créé', 'n_frs' => $newId], 201);
            break;

        case 'PUT':
            if (!$id) error("n_frs requis pour modification", 400);
            if (empty($input['nom'])) error("Le champ 'nom' est requis");
            $stmt = $pdo->prepare("UPDATE fournisseur SET nom = ? WHERE n_frs = ?");
            $stmt->execute([$input['nom'], $id]);
            $stmt->rowCount() === 0 ? error("Fournisseur non trouvé ou aucun changement", 404) : null;
            respond(['message' => 'Fournisseur mis à jour']);
            break;

        case 'DELETE':
            if (!$id) error("n_frs requis pour suppression", 400);
            $stmt = $pdo->prepare("DELETE FROM fournisseur WHERE n_frs = ?");
            $stmt->execute([$id]);
            $stmt->rowCount() === 0 ? error("Fournisseur non trouvé", 404) : null;
            respond(['message' => 'Fournisseur supprimé']);
            break;

        default:
            error("Méthode non autorisée sur /fournisseurs", 405);
    }
}