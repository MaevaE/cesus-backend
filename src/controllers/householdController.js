import pool from "../config/db.js";

export const createHousehold = async (req, res) => {

  try {

    const {
      zone_id,
      household_head,
      address,
      latitude,
      longitude,
      members_count,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO households(
        zone_id,
        household_head,
        address,
        latitude,
        longitude,
        members_count
      )
      VALUES($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        zone_id,
        household_head,
        address,
        latitude,
        longitude,
        members_count,
      ]
    );

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json(error.message);
  }
};