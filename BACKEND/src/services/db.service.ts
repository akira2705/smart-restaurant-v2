import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQL_USER || process.env.DB_USER || "root",
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASS || "root",
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || "restaurant_db",
  port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

type DbQueryParams = Array<string | number | boolean | null | Date>;

export const dbQuery = async <T>(query: string, params: DbQueryParams = []) => {
  const [rows] = await pool.execute(query, params);
  return rows as T;
};

export const initializeDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE,
      phone VARCHAR(15),
      role ENUM('USER', 'MANAGER', 'ADMIN') DEFAULT 'USER',
      contact_info TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tables_reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      table_number INT NOT NULL UNIQUE,
      capacity INT NOT NULL,
      type VARCHAR(50) DEFAULT 'REGULAR',
      status ENUM('AVAILABLE', 'RESERVED', 'OCCUPIED') DEFAULT 'AVAILABLE',
      current_customer_id INT,
      reservation_time DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS queue (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      user_name VARCHAR(100),
      party_size INT NOT NULL,
      phone VARCHAR(15),
      status ENUM('WAITING', 'CALLED', 'SEATED', 'CANCELLED') DEFAULT 'WAITING',
      estimated_time INT,
      position INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      phone VARCHAR(15),
      reservation_date DATE NOT NULL,
      reservation_time TIME NOT NULL,
      guests INT NOT NULL,
      table_type VARCHAR(50),
      special_requests TEXT,
      status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
      table_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_id) REFERENCES tables_reservations(id) ON DELETE SET NULL
    )
  `);
};
