<?php

require_once __DIR__ . '/utils.php';

function handleUsers($pdo, $method, $id, $input) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare("SELECT id, nom, email, role, password FROM users WHERE id = ?");
                $stmt->execute([$id]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $data ? respond($data) : error("Utilisateur non trouvé", 404);
            } else {
                $stmt = $pdo->query("SELECT id, nom, email, role, password FROM users");
                respond($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
            break;

        case 'POST':
            if (empty($input['nom']) || empty($input['email']) || empty($input['password']) || empty($input['role'])) {
                error('Tous les champs requis');
            }
            $hash = password_hash($input['password'], PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, ?)");
            $stmt->execute([$input['nom'], $input['email'], $hash, $input['role']]);
            respond(['message' => 'Utilisateur créé'], 201);
            break;

        case 'PUT':
            if ($id === null || $id === '') {
                error("id requis dans l'URL (exemple : /users/1)", 400);
            }
            if (empty($input['email']) && !isset($input['password'])) {
                error("Au moins email ou nom requis");
            }

            $fields = [];
            $values = [];
            if (isset($input['nom'])) {
                $fields[] = "nom = ?";
                $values[] = $input['nom'];
            }
            if (isset($input['email'])) {
                $fields[] = "email = ?";
                $values[] = $input['email'];
            }
            if (isset($input['password'])) {
                $fields[] = "password = ?";
                $values[] = $input['password'];
            }
            if (isset($input['role'])) {
                $fields[] = "role = ?";
                $values[] = $input['role'];
            }
            if (empty($fields)) {
                error("Aucun champ à modifier");
            }

            $values[] = (int)$id;
            $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ? RETURNING id, nom, email, password";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            if ($stmt->rowCount() === 0) {
                error("Utilisateur non trouvé ou aucun changement", 404);
            }

            $updated = $stmt->fetch(PDO::FETCH_ASSOC);
            respond([
                'message' => 'Utilisateur mis à jour',
                'users' => $updated
            ]);
            break;

        case 'DELETE':
             if ($id === null || $id === '') {
                error("id requis dans l'URL (exemple : /users/5)", 400);
            }
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([(int)$id]);
            if ($stmt->rowCount() === 0) {
                error("Utilisateur non trouvé", 404);
            }
            respond(['message' => 'Utilisateur supprimé']);
            break;
        
        default:
            error('Méthode non autorisée', 405);
    }
}