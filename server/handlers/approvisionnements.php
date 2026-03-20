<?php

require_once __DIR__ . '/utils.php';

function handleApprovisionnements($pdo, $method, $n_frs, $n_produit, $input, $user = null) {

    // Log pour débogage (supprime après test)
    error_log("handleApprovisionnements | Méthode: $method | n_frs: " . var_export($n_frs, true) . " | n_produit: " . var_export($n_produit, true));

    // Correction cruciale : guillemets doubles autour du nom de variable avec point
    if (in_array($method, ['POST','PUT','DELETE']) && $user && isset($user['nom'])) {
        $safe_nom = $pdo->quote($user['nom']);
        $pdo->exec("SET LOCAL \"app.current_user\" = $safe_nom;");
    }

    switch ($method) {

        case 'GET':

            if ($n_frs !== null && $n_produit !== null) {

                $stmt = $pdo->prepare("
                    SELECT n_frs, n_produit, qte_entree
                    FROM approvisionnement
                    WHERE n_frs = ? AND n_produit = ?
                ");

                $stmt->execute([(int)$n_frs, (int)$n_produit]);

                $data = $stmt->fetch(PDO::FETCH_ASSOC);

                $data ? respond($data) : error("Approvisionnement non trouvé", 404);

            } else {

                $stmt = $pdo->query("
                    SELECT n_frs, n_produit, qte_entree
                    FROM approvisionnement
                    ORDER BY n_frs, n_produit
                ");

                respond($stmt->fetchAll(PDO::FETCH_ASSOC));
            }

        break;


        case 'POST':

            if (!isset($input['n_frs']) || !isset($input['n_produit']) || !isset($input['qte_entree'])) {
                error("n_frs, n_produit et qte_entree requis");
            }

            $stmt = $pdo->prepare("
                INSERT INTO approvisionnement (n_frs, n_produit, qte_entree)
                VALUES (?, ?, ?)
            ");

            try {

                $stmt->execute([
                    (int)$input['n_frs'],
                    (int)$input['n_produit'],
                    (int)$input['qte_entree']
                ]);

                respond([
                    'message' => 'Approvisionnement ajouté (trigger actif)'
                ], 201);

            } catch (PDOException $e) {

                error("Erreur insertion : " . $e->getMessage(), 400);
            }

        break;


        case 'PUT':

            if ($n_frs === null || $n_produit === null) {
                error("n_frs et n_produit requis dans l'URL");
            }

            if (!isset($input['qte_entree'])) {
                error("qte_entree requis pour UPDATE");
            }

            $stmt = $pdo->prepare("
                UPDATE approvisionnement
                SET qte_entree = ?
                WHERE n_frs = ? AND n_produit = ?
            ");

            $stmt->execute([
                (int)$input['qte_entree'],
                (int)$n_frs,
                (int)$n_produit
            ]);

            if ($stmt->rowCount() === 0) {
                error("Approvisionnement non trouvé", 404);
            }

            respond([
                'message' => 'Approvisionnement mis à jour (trigger actif)'
            ]);

        break;


        case 'DELETE':

            if ($n_frs === null || $n_produit === null) {
                error("n_frs et n_produit requis dans l'URL");
            }

            $stmt = $pdo->prepare("
                DELETE FROM approvisionnement
                WHERE n_frs = ? AND n_produit = ?
            ");

            $stmt->execute([
                (int)$n_frs,
                (int)$n_produit
            ]);

            if ($stmt->rowCount() === 0) {
                error("Approvisionnement non trouvé", 404);
            }

            respond([
                'message' => 'Approvisionnement supprimé (trigger actif)'
            ]);

        break;


        default:
            error("Méthode non autorisée sur /approvisionnements", 405);
    }
}