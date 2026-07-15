<?php
require_once __DIR__ . '/bootstrap.php';

// Handle GET requests (Session Checks and Logout)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action'])) {
        $action = $_GET['action'];
        
        if ($action === 'check') {
            if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
                echo json_encode(["authenticated" => true]);
            } else {
                echo json_encode(["authenticated" => false]);
            }
            exit();
        }
        
        if ($action === 'logout') {
            // Clear session data
            $_SESSION = [];
            
            // Delete cookie
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            
            // Destroy session
            session_destroy();
            
            echo json_encode(["status" => "success", "message" => "Logged out successfully"]);
            exit();
        }
    }
}

// Handle POST requests (Login Submission)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Support JSON requests and standard form posts
    $input = json_decode(file_get_contents('php://input'), true);
    
    $username = isset($input['username']) ? trim($input['username']) : (isset($_POST['username']) ? trim($_POST['username']) : '');
    $password = isset($input['password']) ? $input['password'] : (isset($_POST['password']) ? $_POST['password'] : '');
    
    // Pre-defined Admin credentials
    $admin_username = "admin";
    $admin_password = "admin123";
    
    if (empty($username) || empty($password)) {
        echo json_encode([
            "status" => "error",
            "message" => "Please enter both username and password."
        ]);
        exit();
    }
    
    if ($username === $admin_username && $password === $admin_password) {
        // Regenerate session ID to prevent session hijacking/fixation
        session_regenerate_id(true);
        $_SESSION['admin_logged_in'] = true;
        
        echo json_encode([
            "status" => "success",
            "message" => "Login successful."
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid username or password."
        ]);
    }
    exit();
}

// Return 405 for other methods
http_response_code(405);
echo json_encode([
    "status" => "error",
    "message" => "Method Not Allowed"
]);
