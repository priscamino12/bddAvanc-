<?php

require_once __DIR__ . '/utils.php';

function handleApprovisionnements($pdo, $method, $n_frs, $n_produit, $input) {
    switch ($method) {
        case 'GET':
            if ($n_frs && $n_produit) {
                $stmt = $pdo->prepare("
                    SELECT * FROM approvisionnement 
                    WHERE n_frs = ? AND n_produit = ?
                ");
                $stmt->execute([$n_frs, $n_produit]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $data ? respond($data) : error("Approvisionnement non trouvé", 404);
            } else {
                $stmt = $pdo->query("SELECT * FROM approvisionnement ORDER BY n_frs, n_produit");
                respond($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
            break;

        case 'POST':
            if (empty($input['n_frs']) || empty($input['n_produit']) || !isset($input['qte_entree'])) {
                error("n_frs, n_produit et qte_entree requis");
            }
            $stmt = $pdo->prepare("
                INSERT INTO approvisionnement (n_frs, n_produit, qte_entree) 
                VALUES (?, ?, ?)
            ");
            try {
                $stmt->execute([$input['n_frs'], $input['n_produit'], (int)$input['qte_entree']]);
                respond(['message' => 'Approvisionnement ajouté (trigger actif)'], 201);
            } catch (PDOException $e) {
                error("Erreur insertion : " . $e->getMessage(), 400);
            }
            break;

        case 'PUT':
            if (!$n_frs || !$n_produit) error("n_frs et n_produit requis pour UPDATE", 400);
            if (!isset($input['qte_entree'])) error("qte_entree requis pour UPDATE");
            $stmt = $pdo->prepare("
                UPDATE approvisionnement 
                SET qte_entree = ? 
                WHERE n_frs = ? AND n_produit = ?
            ");
            $stmt->execute([(int)$input['qte_entree'], $n_frs, $n_produit]);
            if ($stmt->rowCount() === 0) error("Approvisionnement non trouvé", 404);
            respond(['message' => 'Approvisionnement mis à jour (trigger actif)']);
            break;

        case 'DELETE':
            if (!$n_frs || !$n_produit) error("n_frs et n_produit requis pour DELETE", 400);
            $stmt = $pdo->prepare("
                DELETE FROM approvisionnement 
                WHERE n_frs = ? AND n_produit = ?
            ");
            $stmt->execute([$n_frs, $n_produit]);
            if ($stmt->rowCount() === 0) error("Approvisionnement non trouvé", 404);
            respond(['message' => 'Approvisionnement supprimé (trigger actif)']);
            break;

        default:
            error("Méthode non autorisée sur /approvisionnements", 405);
    }
}