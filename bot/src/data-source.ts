import { DataSource } from 'typeorm';
import { GuildConfiguration } from "./typeorm/entities/GuildConfiguration";
import { Membership } from "./typeorm/entities/membership";
import { Payment } from "./typeorm/entities/payment";

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_DB_HOST,
  port: 3306,
  username: process.env.MYSQL_DB_USER,
  password: process.env.MYSQL_DB_PASSWORD,
  database: process.env.MYSQL_DB_DATABASE,
  synchronize: true,
  entities: [GuildConfiguration, Membership, Payment],
  charset: 'utf8mb4',
});