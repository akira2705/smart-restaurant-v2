import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "restaurant.db");

// Create/open database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

console.log("Initializing SQLite database...");

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'USER',
    contact_info TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tables reservations table
  CREATE TABLE IF NOT EXISTS tables_reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number INTEGER NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    type TEXT DEFAULT 'REGULAR',
    status TEXT DEFAULT 'AVAILABLE',
    current_customer_id INTEGER,
    reservation_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Queue table
  CREATE TABLE IF NOT EXISTS queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    user_name TEXT,
    party_size INTEGER NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'WAITING',
    estimated_time INTEGER,
    position INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  -- Reservations table
  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    reservation_date TEXT NOT NULL,
    reservation_time TEXT NOT NULL,
    guests INTEGER NOT NULL,
    table_type TEXT,
    special_requests TEXT,
    status TEXT DEFAULT 'PENDING',
    table_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables_reservations(id) ON DELETE SET NULL
  );
`);

// Insert sample data if tables are empty
const tableCount = db.prepare("SELECT COUNT(*) as count FROM tables_reservations").get() as any;
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;

if (tableCount.count === 0) {
  console.log("Inserting sample tables...");
  const insertTable = db.prepare(
    "INSERT INTO tables_reservations (table_number, capacity, type, status) VALUES (?, ?, ?, ?)"
  );
  
  insertTable.run(1, 2, "REGULAR", "AVAILABLE");
  insertTable.run(2, 2, "REGULAR", "AVAILABLE");
  insertTable.run(3, 4, "REGULAR", "AVAILABLE");
  insertTable.run(4, 4, "REGULAR", "RESERVED");
  insertTable.run(5, 6, "LARGE", "AVAILABLE");
  insertTable.run(6, 8, "LARGE", "OCCUPIED");
}

if (userCount.count === 0) {
  console.log("Inserting sample users...");
  const insertUser = db.prepare(
    "INSERT INTO users (name, email, phone, role) VALUES (?, ?, ?, ?)"
  );
  
  insertUser.run("John Doe", "john@example.com", "555-0101", "USER");
  insertUser.run("Jane Smith", "jane@example.com", "555-0102", "MANAGER");
  insertUser.run("Admin User", "admin@example.com", "555-0103", "ADMIN");
}

console.log("✅ SQLite database initialized successfully!");
console.log(`📁 Database location: ${dbPath}`);

db.close();
