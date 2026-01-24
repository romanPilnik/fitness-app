import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  dbUri: string;
  jwtSecret: string;
  jwtExpiration?: string;
  nodeEnv: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 5001,
  dbUri: process.env.DB_URI || 'mongodb://localhost:27017/myapp',
  jwtSecret: process.env.JWT_SECRET || 'defaultsecret',
  jwtExpiration: process.env.JWT_EXPIRE || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;
