<?php
require_once __DIR__ . '/bootstrap.php';

$config = require __DIR__ . '/config.php';

$host = $config['host'];
$username = $config['username'];
$password = $config['password'];
$database = $config['database'];

try {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    $conn = new mysqli($host, $username, $password, $database);
    $conn->set_charset("utf8mb4");

} catch (Exception $e) {
    die("Database Connection Failed: " . $e->getMessage());
}