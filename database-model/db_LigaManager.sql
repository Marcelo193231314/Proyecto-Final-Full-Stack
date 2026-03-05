DROP DATABASE IF EXISTS liga_amateur;
CREATE DATABASE liga_amateur;
USE liga_amateur;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL
);

CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    captain_id INT,
    FOREIGN KEY (captain_id) REFERENCES users(id)
);

CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    local_team_id INT,
    visitor_team_id INT,
    match_date DATETIME NOT NULL,
    location VARCHAR(100),
    local_score INT DEFAULT 0,                                   
    visitor_score INT DEFAULT 0,                                 
    status ENUM('Pendiente', 'Finalizado') DEFAULT 'Pendiente',  
    FOREIGN KEY (local_team_id) REFERENCES teams(id),
    FOREIGN KEY (visitor_team_id) REFERENCES teams(id)
);