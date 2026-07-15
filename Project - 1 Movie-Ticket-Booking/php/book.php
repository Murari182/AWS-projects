<?php
require_once 'bootstrap.php';

// Check if user is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access. Please log in to book tickets."
    ]);
    exit();
}

// Check for POST request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Method Not Allowed"
    ]);
    exit();
}

// Include database connection
require_once __DIR__ . '/db.php';

// Get POST data (JSON or Form)
$input = json_decode(file_get_contents('php://input'), true);

$customer_name = isset($input['customer_name']) ? trim($input['customer_name']) : (isset($_POST['customer_name']) ? trim($_POST['customer_name']) : '');
$email = isset($input['email']) ? trim($input['email']) : (isset($_POST['email']) ? trim($_POST['email']) : '');
$movie_name = isset($input['movie_name']) ? trim($input['movie_name']) : (isset($_POST['movie_name']) ? trim($_POST['movie_name']) : '');
$seats = isset($input['seats']) ? (int)$input['seats'] : (isset($_POST['seats']) ? (int)$_POST['seats'] : 0);
$booking_date = isset($input['booking_date']) ? trim($input['booking_date']) : (isset($_POST['booking_date']) ? trim($_POST['booking_date']) : '');

// Server-side Validations
$errors = [];

if (empty($customer_name)) {
    $errors[] = "Customer name is required.";
} elseif (strlen($customer_name) > 100) {
    $errors[] = "Customer name must be less than 100 characters.";
}

if (empty($email)) {
    $errors[] = "Email address is required.";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Please enter a valid email address.";
}

if (empty($movie_name)) {
    $errors[] = "Please select a movie.";
}

if ($seats <= 0) {
    $errors[] = "Number of seats must be a positive integer.";
} elseif ($seats > 10) {
    $errors[] = "You can book a maximum of 10 seats per booking.";
}

if (empty($booking_date)) {
    $errors[] = "Booking date is required.";
} else {
    // Ensure date is not in the past
    $today = new DateTime();
    $today->setTime(0, 0, 0); // Start of today
    $booking_dt = DateTime::createFromFormat('Y-m-d', $booking_date);
    
    if (!$booking_dt || $booking_dt->format('Y-m-d') !== $booking_date) {
        $errors[] = "Invalid booking date format. Use YYYY-MM-DD.";
    } elseif ($booking_dt < $today) {
        $errors[] = "Booking date cannot be in the past.";
    }
}

// Return validation errors if any
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => implode(" ", $errors)
    ]);
    exit();
}

// Sanitize inputs for SQL execution and XSS prevention
$customer_name = htmlspecialchars($customer_name, ENT_QUOTES, 'UTF-8');
$email = filter_var($email, FILTER_SANITIZE_EMAIL);
$movie_name = htmlspecialchars($movie_name, ENT_QUOTES, 'UTF-8');

// Prepared statement insert
$query = "INSERT INTO bookings (customer_name, email, movie_name, seats, booking_date) VALUES (?, ?, ?, ?, ?)";
$stmt = null;

try {
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Database statement preparation failed: " . $conn->error);
    }
    
    $stmt->bind_param("sssis", $customer_name, $email, $movie_name, $seats, $booking_date);
    
    if ($stmt->execute()) {
        $booking_id = $stmt->insert_id;
        echo json_encode([
            "status" => "success",
            "message" => "Ticket Booked Successfully!",
            "booking_id" => $booking_id
        ]);
    } else {
        throw new Exception("Booking failed. Please try again: " . $stmt->error);
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
