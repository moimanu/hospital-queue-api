import { db } from "../database/db";

export type LastDaysEntry = {
  date: string;
  quantity: number;
};

export const LastDaysRepository = {
  insertOrIncrement(patient_id: string) {
    db.prepare(`
      INSERT INTO LastDays (date, quantity)
      VALUES (date('now', 'localtime'), 1)
      ON CONFLICT(date) DO UPDATE SET quantity = quantity + 1
    `).run(patient_id);
  },

  getLastSevenDays(): LastDaysEntry[] {
    const stmt = db.prepare(`
      SELECT date, quantity
      FROM LastDays
      WHERE date >= date('now', 'localtime', '-6 days')
      ORDER BY date ASC
    `);
    return stmt.all() as LastDaysEntry[];
  }
};
