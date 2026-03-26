import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  portLabel: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiration?: string;
  nodeEnv: string;
}

const parsedPort = Number(process.env.PORT ?? 5001);
const port = Number.isFinite(parsedPort) ? parsedPort : 5001;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const config: Config = {
  port,
  portLabel: String(port),
  databaseUrl,
  jwtSecret: process.env.JWT_SECRET ?? "defaultsecret",
  jwtExpiration: process.env.JWT_EXPIRE ?? "7d",
  nodeEnv: process.env.NODE_ENV ?? "development",
};

export default config;
