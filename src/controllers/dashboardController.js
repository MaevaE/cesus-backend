import pool from "../config/db.js";

export const getDashboardStats = async (req, res) => {

  try {

    const population = await pool.query(
      "SELECT COUNT(*) FROM individuals"
    );

    const households = await pool.query(
      "SELECT COUNT(*) FROM households"
    );

    const agents = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role='agent'"
    );

    res.json({
      population: population.rows[0].count,
      households: households.rows[0].count,
      agents: agents.rows[0].count,
    });

  } catch (error) {
    res.status(500).json(error.message);
  }
};