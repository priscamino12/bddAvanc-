<?php
require_once __DIR__ . '/utils.php';

function handleAudits($pdo, $method) {

    switch ($method) {

        // ✅ GET → récupérer audits
        case 'GET':

            $stmt = $pdo->query("
                SELECT 
                    id,
                    type_action,
                    date_mise_a_jour,
                    nom AS nom_fournisseur,
                    design,
                    qte_entree_ancien,
                    qte_entree_nouv,
                    utilisateur
                FROM audit_approvisionnement
                ORDER BY date_mise_a_jour DESC
            ");

            $audits = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $stats = $pdo->query("
                SELECT 
                    COUNT(*) FILTER (WHERE type_action = 'ajout') AS insertions,
                    COUNT(*) FILTER (WHERE type_action = 'modification') AS modifications,
                    COUNT(*) FILTER (WHERE type_action = 'suppression') AS suppressions
                FROM audit_approvisionnement
            ")->fetch(PDO::FETCH_ASSOC);

            respond([
                'audits' => $audits,
                'stats' => $stats ?: [
                    'insertions' => 0,
                    'modifications' => 0,
                    'suppressions' => 0
                ]
            ]);

        break;

        // ✅ DELETE → supprimer TOUS les audits
        case 'DELETE':

            $pdo->exec("TRUNCATE TABLE audit_approvisionnement RESTART IDENTITY");

            respond([
                'message' => 'Tous les audits ont été supprimés'
            ]);

        break;

        default:
            error("Méthode non autorisée sur /audits", 405);
    }
}