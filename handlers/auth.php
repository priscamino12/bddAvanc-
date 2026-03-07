<?php

require_once __DIR__ . '/utils.php';

function handleLogin($pdo, $input) {
    if (empty($input['email']) || empty($input['password'])) {
        error('Email et mot de passe requis', 400);
    }

    $stmt = $pdo->prepare("SELECT id, nom, password, role FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($input['password'], $user['password'])) {
        $token = base64_encode($user['id'] . ':' . $user['role']);
        respond(['message' => 'Connexion réussie', 'token' => $token, 'user' => ['nom' => $user['nom'], 'role' => $user['role']]]);
    } else {
        error('Identifiants invalides', 401);
    }
}