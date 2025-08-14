import { db } from "../database/db";

export type LastDaysEntry = {
  date: string;
  quantity: number;
};

export const LastDaysRepository = {
  insertOrIncrement(date: string) {
    const stmt = db.prepare(`
      INSERT INTO LastDays (date, quantity)
      VALUES (?, 1)
      ON CONFLICT(date) DO UPDATE SET quantity = quantity + 1
    `);
    stmt.run(date);
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
