import pool from "../config/db";

export interface Registration {
  id: number;
  event_id: number;
  participant_name: string;
  participant_email: string;
  status: "registered" | "cancelled";
  cancel_reason: string | null;
  registered_at: string;
}

export interface CreateRegistrationInput {
  event_id: number;
  participant_name: string;
  participant_email: string;
}

const RegistrationModel = {
  async findByEventId(eventId: number): Promise<Registration[]> {
    const result = await pool.query(
      `SELECT * FROM registrations WHERE event_id = $1 ORDER BY registered_at DESC`,
      [eventId]
    );
    return result.rows;
  },

  async findById(id: number): Promise<Registration | null> {
    const result = await pool.query(
      "SELECT * FROM registrations WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  },

  async create(data: CreateRegistrationInput): Promise<Registration> {
    const result = await pool.query(
      `INSERT INTO registrations (event_id, participant_name, participant_email)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.event_id, data.participant_name, data.participant_email]
    );
    return result.rows[0];
  },

  async cancelRegistration(
    id: number,
    reason: string
  ): Promise<Registration | null> {
    const result = await pool.query(
      `UPDATE registrations
       SET status = 'cancelled', cancel_reason = $1
       WHERE id = $2
       RETURNING *`,
      [reason, id]
    );
    return result.rows[0] || null;
  },

  async countByEventId(
    eventId: number
  ): Promise<{ registered: number; cancelled: number }> {
    const result = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'registered') AS registered,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled
       FROM registrations WHERE event_id = $1`,
      [eventId]
    );
    return {
      registered: parseInt(result.rows[0].registered),
      cancelled: parseInt(result.rows[0].cancelled),
    };
  },
};

export default RegistrationModel;
