<?php

require_once __DIR__ . '/connection.php';

$pdo = getAppPdo();

try {
    $adminEmail = 'admin@example.com';
    $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("
        INSERT INTO users (nom, email, password, role) 
        VALUES (?, ?, ?, ?) 
        ON CONFLICT (email) DO NOTHING
    ");
    $stmt->execute(['Admin', $adminEmail, $adminPassword, 'admin']);
    echo "Compte admin créé (email: $adminEmail, MDP: admin123). Exécute php -S localhost:8000 api.php\n";
} catch (PDOException $e) {
    echo "Erreur seed : " . $e->getMessage() . "\n";
}