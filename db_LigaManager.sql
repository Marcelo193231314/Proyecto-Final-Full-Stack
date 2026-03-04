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
    status ENUM('Programado', 'En Juego', 'Suspendido', 'Finalizado') DEFAULT 'Programado',
    FOREIGN KEY (local_team_id) REFERENCES teams(id),
    FOREIGN KEY (visitor_team_id) REFERENCES teams(id)
);


ALTER TABLE matches 
ADD COLUMN local_score INT DEFAULT 0,
ADD COLUMN visitor_score INT DEFAULT 0;


ALTER TABLE matches MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pendiente';


UPDATE matches 
SET status = 'Pendiente' 
WHERE status NOT IN ('Pendiente', 'Finalizado');

ALTER TABLE matches 
MODIFY COLUMN status ENUM('Pendiente', 'Finalizado') DEFAULT 'Pendiente';