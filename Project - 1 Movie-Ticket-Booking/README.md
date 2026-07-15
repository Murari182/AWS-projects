# CineReserve – Movie Ticket Booking Portal

## Overview

CineReserve is a full-stack Movie Ticket Booking Portal developed using **HTML5, CSS3, JavaScript (ES6), PHP, and MySQL**. The application enables administrators to manage movie ticket bookings through a responsive web interface. It supports both **local deployment using XAMPP** and **cloud database deployment using Amazon RDS (MySQL)**.

---

## Developer

**Sreeramadasu Mukunda Rama Chary**
B.Tech in Mathematics and Computing
Rajiv Gandhi Institute of Petroleum Technology (RGIPT)

---

## Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)

### Backend

* PHP

### Database

* MySQL
* Amazon RDS (MySQL)

### Development Environment

* XAMPP
* AWS Management Console

---

## Project Structure

```text
Project - 1 Movie-Ticket-Booking/
│
├── index.html
├── login.html
├── booking.html
├── view.html
├── database.sql
├── README.md
│
├── css/
│   └── style.css
│
├── js/
│   ├── booking.js
│   ├── login.js
│   └── view.js
│
├── php/
│   ├── book.php
│   ├── bootstrap.php
│   ├── config.php
│   ├── db.php
│   ├── fetch.php
│   ├── login.php
│   └── test_connection.php
│
├── images/
│   ├── galactic_odyssey.png
│   ├── shadow_knight.png
│   └── whispers_forest.png
│
├── local_Testing/
│   └── 1.png to 8.png (Local deployment/testing screenshots)
│
└── Cloud_Testing/
    └── 1.png to 12.png (Cloud deployment/testing screenshots)
```

---

## Features

* Secure administrator login
* Movie ticket booking
* Booking management
* Responsive user interface
* Session-based authentication
* Live booking search
* MySQL database integration
* Amazon RDS database connectivity

---

## Local Installation

### Prerequisites

* XAMPP
* PHP
* MySQL

### Step 1: Clone the Repository

```bash
git clone https://github.com/Murari182/CineReserve.git
```

Or download the ZIP file and extract it into:

```text
C:\xampp\htdocs\
```

### Step 2: Start XAMPP

Start the following services:

* Apache
* MySQL

### Step 3: Create the Database

Open:

```text
http://localhost/phpmyadmin
```

Create a database named:

```text
movie_db
```

Import the provided database file:

```text
database.sql
```

### Step 4: Run the Application

Open your browser and navigate to:

```text
http://localhost/Movie-Ticket-Booking/
```

---

## Amazon RDS Configuration

The application can also be connected to an Amazon RDS MySQL instance.

Update the database configuration in:

```text
php/db.php
```

Example:

```php
$host = "your-rds-endpoint.ap-southeast-2.rds.amazonaws.com";
$username = "admin";
$password = "your_password";
$database = "movie_db";
```

Import the database schema into the RDS instance:

```bash
mysql -h your-rds-endpoint.ap-southeast-2.rds.amazonaws.com \
-u admin -p movie_db < database.sql
```

---

## Security Features

* Prepared Statements
* SQL Injection Prevention
* Session-Based Authentication
* Input Validation
* Cross-Site Scripting (XSS) Protection
* Secure Database Connectivity

---

## Default Administrator Credentials

| Field    | Value      |
| -------- | ---------- |
| Username | `admin`    |
| Password | `admin123` |

> **Note:** These credentials are intended for development and demonstration purposes only. They should be changed before deploying the application in a production environment.

---

## AWS Services Used

* Amazon RDS (MySQL)
* Amazon VPC
* AWS Security Groups
* AWS Management Console

---

## Future Enhancements

* Online payment gateway integration
* Interactive seat selection
* Email ticket confirmation
* Movie poster upload
* User registration and authentication
* Administrative dashboard
* Booking history
* Role-based access control
* Responsive mobile optimization

---

## License

This project has been developed for educational and academic purposes.

---

## Author

**Sreeramadasu Mukunda Rama Chary**
B.Tech in Mathematics and Computing
Rajiv Gandhi Institute of Petroleum Technology (RGIPT)

GitHub: https://github.com/Murari182
