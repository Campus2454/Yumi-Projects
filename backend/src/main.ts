import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import * as express from 'express';
import { TypeormStore } from 'connect-typeorm';
import { Connection, ConnectionOptions, createConnection, getRepository } from 'typeorm';
import { Session } from './utils/typeorm/entities/Session';
import { entities } from './utils/typeorm';
import * as cors from 'cors';
import { Request, Response } from 'express';
import * as chalk from 'chalk';
import { NestExpressApplication } from '@nestjs/platform-express';
import { status as Sstatus } from './status';


async function bootstrap() {
  const port = process.env.IS_DEV === 'true' ? 3011 : 3001;
  await createConnection({
    type: 'mysql',
    host: process.env.MYSQL_DB_HOST,
    port: 3306,
    username: process.env.MYSQL_DB_USER,
    password: process.env.MYSQL_DB_PASSWORD,
    database: process.env.MYSQL_DB_DATABASE,
    synchronize: true,
    entities: entities,
    charset: 'utf8mb4',
  })
  .then(() => {console.log((chalk.green(' - ✔')),'Connected to the database successfully.');})
  .catch((error) => {console.log((chalk.red(' - ✖',error)));});
  const sessionRepository = getRepository(Session);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // app.setGlobalPrefix('api');

  app.use(
    session({
      secret: process.env.COOKIE_SECRET,
      resave: false,
      saveUninitialized: false, 
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      },
      store: new TypeormStore().connect(sessionRepository),
    }),
  );

  const status = new Sstatus();
  const whitelist = ['https://yumistack.net', 'https://api.yumistack.net'];
  const testWhitelist = ['http://localhost:3000', 'http://148.113.174.253:3000', 'https://yumistack.net', 'https://api.yumistack.net', 'https://admin.yumistack.net'];

  app.enableCors({
    origin: testWhitelist,
    credentials: true,
  });
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/payment/stripe-webhook', express.raw({ type: 'application/json' }));
  app.set('trust proxy', 1);

  try {
    await app.listen(port);
    console.log(`Running on: ${await app.getUrl()}`);
    await status.status(process);
  } catch (err) {
    console.log(err);
  }
}
bootstrap();
