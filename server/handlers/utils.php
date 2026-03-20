<?php

function respond($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

function error($message, $status = 400) {
    respond(['error' => $message], $status);
}

// Valide token simple (base64 id:role)
function validateToken($token) {
    if (!$token) return false;

    $decoded = base64_decode($token);
    $parts = explode(':', $decoded);

    if (count($parts) !== 3) return false;

    list($id, $role, $nom) = $parts;

    if ($id && $role && $nom && in_array($role, ['admin', 'user'])) {
        return ['id' => $id, 'role' => $role, 'nom' => $nom];
    }

    return false;
}
