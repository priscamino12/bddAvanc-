<?php

require_once 'config.php';
require_once 'database/connection.php';


require_once 'handlers/utils.php';
require_once 'handlers/auth.php';  
require_once 'handlers/users.php';
require_once 'handlers/produits.php';
require_once 'handlers/fournisseurs.php';
require_once 'handlers/approvisionnements.php';
require_once 'handlers/audits.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$uri = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$resource = $uri[0] ?? '';
$id = $uri[1] ?? null;
$id2 = $uri[2] ?? null;


$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];

$pdo = getAppPdo();

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);
$user = validateToken($token);

if ($resource !== 'auth' && !$user) {
    error('Authentification requise', 401);
}

switch ($resource) {
    case 'auth':
        if ($subResource === 'login') {
            handleLogin($pdo, $input);
        }
        break;

    case 'users':
        if ($user['role'] !== 'admin') error('Accès admin requis', 403);
        handleUsers($pdo, $method, $id, $input);
        break;

    case 'produits':
        handleProduits($pdo, $method, $id, $input, $user);
        break;


    case 'fournisseurs':
        handleFournisseurs($pdo, $method, $id, $input, $user);
        break;

    case 'approvisionnements':
        handleApprovisionnements($pdo, $method, $id, $id2, $input, $user);
        break;

    case 'audits':
        if ($user['role'] !== 'admin') error('Accès admin requis', 403);
        handleAudits($pdo, $method);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Route non trouvée']);
        exit;
}