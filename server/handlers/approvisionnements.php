<?php

require_once __DIR__ . '/utils.php';

function handleApprovisionnements($pdo, $method, $n_frs, $n_produit, $input, $user = null) {

    // ================= USER =================
    $user_name = 'inconnu';

    if ($user && !empty($user['nom'])) {
        $user_name = $user['nom'];
        error_log("[AUDIT] Utilisateur détecté : " . $user_name);
    } else {
        error_log("[AUDIT] Aucun utilisateur → inconnu");
    }

    // 🔥 Injecter UNIQUEMENT pour actions
    if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
        $stmtUser = $pdo->prepare("SELECT set_config('app.current_user', ?, false)");
        $stmtUser->execute([$user_name]);
    }

    // ================= ROUTES =================
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

            if (!isset($input['n_frs'], $input['n_produit'], $input['qte_entree'])) {
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

                respond(['message' => 'Approvisionnement ajouté'], 201);

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

            respond(['message' => 'Approvisionnement mis à jour']);

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

            respond(['message' => 'Approvisionnement supprimé']);

        break;


        default:
            error("Méthode non autorisée sur /approvisionnements", 405);
    }
}