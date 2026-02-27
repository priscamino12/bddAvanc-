<?php

function respond($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

function error($message, $status = 400) {
    respond(['error' => $message], $status);
}