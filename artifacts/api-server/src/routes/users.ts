import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/users", async (_req, res): Promise<void> => {
  const result = await pool.query(`
    SELECT 
      telegram_id,
      username,
      first_name,
      last_name,
      language_code,
      first_seen,
      last_seen,
      message_count
    FROM bot_users
    ORDER BY last_seen DESC
  `);
  res.json(result.rows);
});

router.get("/stats", async (_req, res): Promise<void> => {
  const totalResult = await pool.query("SELECT COUNT(*) as total FROM bot_users");
  const todayResult = await pool.query(`
    SELECT COUNT(*) as today
    FROM bot_users
    WHERE last_seen >= NOW() - INTERVAL '24 hours'
  `);
  const weekResult = await pool.query(`
    SELECT COUNT(*) as week
    FROM bot_users
    WHERE first_seen >= NOW() - INTERVAL '7 days'
  `);
  const activeResult = await pool.query(`
    SELECT COUNT(*) as active
    FROM bot_users
    WHERE last_seen >= NOW() - INTERVAL '7 days'
  `);
  const dailyResult = await pool.query(`
    SELECT 
      DATE(first_seen) as date,
      COUNT(*) as new_users
    FROM bot_users
    WHERE first_seen >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(first_seen)
    ORDER BY date ASC
  `);

  res.json({
    total: parseInt(totalResult.rows[0].total),
    today: parseInt(todayResult.rows[0].today),
    newThisWeek: parseInt(weekResult.rows[0].week),
    activeThisWeek: parseInt(activeResult.rows[0].active),
    dailyNewUsers: dailyResult.rows,
  });
});

export default router;
