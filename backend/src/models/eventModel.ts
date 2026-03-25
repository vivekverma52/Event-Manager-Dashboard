import pool from "../config/db";

export interface Event {
  id: number;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  name: string;
  description?: string;
  date: string;
  location?: string;
}

export interface UpdateEventInput {
  name?: string;
  description?: string;
  date?: string;
  location?: string;
}

export interface EventFilter {
  search?: string;
  location?: string;
  date?: string;
  sortBy?: "date_asc" | "date_desc" | "name_asc" | "name_desc";
}

const EventModel = {
  async findAll(filters: EventFilter = {}): Promise<Event[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (filters.search) {
      conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
      values.push(`%${filters.search}%`);
      idx++;
    }
    if (filters.location) {
      conditions.push(`location ILIKE $${idx}`);
      values.push(`%${filters.location}%`);
      idx++;
    }
    if (filters.date) {
      conditions.push(`date = $${idx}`);
      values.push(filters.date);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const orderMap: Record<string, string> = {
      date_asc: "date ASC",
      date_desc: "date DESC",
      name_asc: "name ASC",
      name_desc: "name DESC",
    };
    const order = filters.sortBy ? orderMap[filters.sortBy] : "created_at DESC";

    const query = `SELECT * FROM events ${where} ORDER BY ${order}`;
    const result = await pool.query(query, values);
    return result.rows;
  },

  async findById(id: number): Promise<Event | null> {
    const result = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async create(data: CreateEventInput): Promise<Event> {
    const result = await pool.query(
      `INSERT INTO events (name, description, date, location)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.description || null, data.date, data.location || null]
    );
    return result.rows[0];
  },

  async update(id: number, data: UpdateEventInput): Promise<Event | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx}`);
      values.push(data.name);
      idx++;
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx}`);
      values.push(data.description);
      idx++;
    }
    if (data.date !== undefined) {
      fields.push(`date = $${idx}`);
      values.push(data.date);
      idx++;
    }
    if (data.location !== undefined) {
      fields.push(`location = $${idx}`);
      values.push(data.location);
      idx++;
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE events SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM events WHERE id = $1 RETURNING id",
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  },
};

export default EventModel;
