-- Movie Ticket Booking Database Schema
-- Compatible with local XAMPP and AWS RDS MySQL

CREATE DATABASE IF NOT EXISTS `movie_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `movie_db`;

CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `movie_name` VARCHAR(100) NOT NULL,
  `seats` INT NOT NULL,
  `booking_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
