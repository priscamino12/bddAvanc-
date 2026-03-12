<?php

require_once __DIR__ . '/utils.php';

function handleAudits($pdo, $method) {
    if ($method !== 'GET') {
        error("Seule la méthode GET est autorisée sur /audits", 405);
    }

    $stmt = $pdo->query("SELECT * FROM audit_approvisionnement ORDER BY date_mise_a_jour DESC");
    $audits = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stats = $pdo->query("
        SELECT 
            COUNT(*) FILTER (WHERE type_action = 'ajout') AS insertions,
            COUNT(*) FILTER (WHERE type_action = 'modification') AS modifications,
            COUNT(*) FILTER (WHERE type_action = 'suppression') AS suppressions
        FROM audit_approvisionnement
    ")->fetch(PDO::FETCH_ASSOC);

    respond(['audits' => $audits, 'stats' => $stats]);
}