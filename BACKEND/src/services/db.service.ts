import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "restaurant.db");
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

db.exec(`
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

const tableCount = db
  .prepare("SELECT COUNT(*) as count FROM tables_reservations")
  .get() as { count: number };

if (tableCount.count === 0) {
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

// Export a wrapper to make it compatible with mysql2/promise interface
export const dbQuery = (sql: string, params: any[] = []) => {
  try {
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith("SELECT")) {
      return [stmt.all(...params)];
    } else {
      const result = stmt.run(...params);
      return [{ insertId: result.lastInsertRowid, affectedRows: result.changes }];
    }
  } catch (error) {
    throw error;
  }
};
