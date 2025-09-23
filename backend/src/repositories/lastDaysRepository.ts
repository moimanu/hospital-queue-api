import { db } from "../database/db";
import { getLocalISODate } from "../helpers/dateHelper";

export type LastDaysEntry = {
  date: string;
  quantity: number;
};

export const LastDaysRepository = {
  insertOrIncrement() {
    const today = getLocalISODate();

    db.prepare(`
      INSERT INTO LastDays (date, quantity)
      VALUES (?, 1)
      ON CONFLICT(date) DO UPDATE SET quantity = quantity + 1
    `).run(today);
  },

  getLastSevenDays(): LastDaysEntry[] {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);

    const startDateISO = getLocalISODate(startDate);

    const stmt = db.prepare(`
      SELECT date, quantity
      FROM LastDays
      WHERE date >= ?
      ORDER BY date ASC
    `);

    return stmt.all(startDateISO) as LastDaysEntry[];
  }
};
