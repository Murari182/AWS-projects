<?php
// Prevent PHP from outputting HTML error pages or messages
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set default Content-Type header to JSON
if (!headers_sent()) {
    header('Content-Type: application/json; charset=utf-8');
}

// Convert all PHP errors (warnings, notices, deprecations) to ErrorExceptions
set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        // This error code is not included in error_reporting
        return false;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// Global exception handler to output valid JSON
set_exception_handler(function($exception) {
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    
    echo json_encode([
        "status" => "error",
        "message" => "An internal server error occurred: " . $exception->getMessage(),
        "error_details" => [
            "type" => get_class($exception),
            "file" => basename($exception->getFile()),
            "line" => $exception->getLine()
        ]
    ]);
    exit();
});

// Configure and start secure session
if (session_status() === PHP_SESSION_NONE) {
    $secure_cookie = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $secure_cookie,
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
    session_start();
}
