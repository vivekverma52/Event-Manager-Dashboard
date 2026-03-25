import pool from "./db";

const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        location TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        participant_name TEXT NOT NULL,
        participant_email TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
        cancel_reason TEXT,
        registered_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(event_id, participant_email)
      );
    `);
    console.log("✅ Database tables initialized successfully");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

initDb();
