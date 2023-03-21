CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS playground_areas (
  id SERIAL PRIMARY KEY,
  playground_name VARCHAR(255),
  address VARCHAR(255),
  area GEOMETRY (POLYGON, 4326)
);

CREATE INDEX playground_areas_area_idx ON playground_areas USING gist(area);

