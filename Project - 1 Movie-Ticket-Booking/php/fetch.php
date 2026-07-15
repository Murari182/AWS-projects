<?php
require_once 'bootstrap.php';

// Check if user is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access. Please log in to view bookings."
    ]);
    exit();
}

// Check for GET request method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Method Not Allowed"
    ]);
    exit();
}

// Include database connection
require_once __DIR__ . '/db.php';

// Prepare and execute query to fetch all bookings, sorted by newest first (id DESC)
$query = "SELECT id, customer_name, email, movie_name, seats, booking_date FROM bookings ORDER BY id DESC";
$stmt = null;

try {
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Database query statement preparation failed: " . $conn->error);
    }
    
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $bookings = [];
        
        while ($row = $result->fetch_assoc()) {
            // Sanitize database outputs before sending to client for XSS prevention
            $bookings[] = [
                "id" => (int)$row['id'],
                "customer_name" => htmlspecialchars($row['customer_name'], ENT_QUOTES, 'UTF-8'),
                "email" => htmlspecialchars($row['email'], ENT_QUOTES, 'UTF-8'),
                "movie_name" => htmlspecialchars($row['movie_name'], ENT_QUOTES, 'UTF-8'),
                "seats" => (int)$row['seats'],
                "booking_date" => $row['booking_date']
            ];
        }
        
        echo json_encode([
            "status" => "success",
            "data" => $bookings
        ]);
    } else {
        throw new Exception("Failed to retrieve bookings: " . $stmt->error);
    }
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
} finally {
    if ($stmt) {
        $stmt->close();
    }
    if ($conn) {
        $conn->close();
    }
}
