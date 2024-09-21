import { DataSource } from "typeorm";

// using host: "host.docker.internal" enables reaching the postgres database


// PostgreSQL DataSource
const postgresDataSource = new DataSource({
  type: "postgres",
  url: "postgresql://postgres:12345@localhost:5432/FlightDB",
});

// MongoDB DataSource
const mongodbDataSource = new DataSource({
  type: "mongodb",
  url: "mongodb://localhost:27017",
});

export { postgresDataSource, mongodbDataSource };
