import * as dotenv from 'dotenv';
dotenv.config();

export const appConfig = {
  port: process.env.PORT || 3000,
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/',
    dbName: process.env.MONGO_DB_NAME || 'youapp',
  },
  rabbitmq: {
    uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
  },
};
