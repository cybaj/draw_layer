const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get('/playgrounds', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, playground_name, address, ST_AsGeoJSON(area) as area FROM playground_areas;');
    const playgrounds = result.rows.map((row) => {
      return {
        id: row.id,
        playground_name: row.playground_name,
        address: row.address,
        area: JSON.parse(row.area),
      };
    });
    res.json(playgrounds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching the data.' });
  }
});

app.post('/playgrounds', express.json(), async (req, res) => {
  try {
    const geojson = req.body;

    // Log the received GeoJSON object
    console.log('Received GeoJSON:', geojson);

    const result = await pool.query(`
      INSERT INTO playground_areas (area)
      VALUES (ST_GeomFromGeoJSON($1))
      RETURNING id;
    `, [JSON.stringify(geojson.geometry)]);

    res.json({ id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while saving the playground area.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});

