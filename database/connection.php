<?php

require_once __DIR__ . '/../config.php';

function getPdoConnection($dbname = DB_NAME) {
    $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . $dbname;
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASSWORD);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        die("Erreur de connexion à la base '$dbname' : " . $e->getMessage());
    }
}

function getDefaultPdo() {
    return getPdoConnection(DB_DEFAULT);
}

function getAppPdo() {
    return getPdoConnection(DB_NAME);
}