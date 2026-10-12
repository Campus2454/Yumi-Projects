require('dotenv').config();
import "reflect-metadata";
import { registerSlashCommands, registerCommands, registerEvents } from './utils/registry';
import { } from 'dotenv';
import DiscordClient from './client/client';
import { GuildConfiguration } from "./typeorm/entities/GuildConfiguration";
// import { getRepository, createConnection } from "typeorm";
import { ActivityType, Client, Collection, DiscordAPIError, IntentsBitField, TextBasedChannel } from 'discord.js';
import { slashCommands } from "./slashCommands/SlashCommands";
import chalk from 'chalk';
import { buttons } from "./slashCommands/Button";
import { modals } from "./slashCommands/ModalSubmit";
import { selectMenu } from "./slashCommands/SelectMenu";
import { auditLogEvents } from "./events/auditLogEvents";
import { botEvents } from "./events/botEvents";
import { events } from "./events/events";
import express, { Request, Response } from 'express';
import { Membership } from "./typeorm/entities/membership";
import { Payment } from "./typeorm/entities/payment";
import readline from 'readline';
import { setTimeout as wait } from 'node:timers/promises';
import { AppDataSource } from "./data-source";
import { status as Sstatus } from "./status";

process.on('unhandledRejection', (reason) => {
  if(reason instanceof DiscordAPIError){
    if(String(reason.code).startsWith('10')){
      return;
    };
  }
  console.warn(chalk.red('[Yumi ERROR] Unhandled Rejection'), chalk.yellow(reason));
});process.on('uncaughtException', (err) => {
  console.error(chalk.red('[Yumi ERROR] Uncaught Exception'), chalk.yellow(err));
  process.exit(1);
});

const client = new DiscordClient({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    // IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildVoiceStates,
    // IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.GuildModeration,
  ],
  rest: {
    timeout: 60000,
  },
});
const status = new Sstatus();
function webStatus() {
  const app = express();
  const PORT = 3005;
  app.get('/', (req: Request, res: Response) => {
      res.send('บอทรัน');
  });
  async function ping() {
    app.get('/ping', (req: Request, res: Response) => {
      res.send(`${client.ws.ping}`);
    });
  };
  if(client.ws.ping){setInterval(ping, 10_000)};
  app.listen(PORT, () => {
      console.log(`${chalk.green(' - ✔')} Server is running on http://localhost:${PORT}/ and http://localhost:${PORT}/ping`);
  });
};
export const externalCommands = {
  slashCommands: ['music'] as string[],
  buttons: ['music'] as string[],
  modals: [] as string[],
  selectMenu: ['music'] as string[]
};
(async () => {
  const connection_start = new Date().getTime();
  // await createConnection({
  //   type: 'mysql',
  //   host: process.env.MYSQL_DB_HOST,
  //   port: 3306,
  //   username: process.env.MYSQL_DB_USER,
  //   password: process.env.MYSQL_DB_PASSWORD,
  //   database: process.env.MYSQL_DB_DATABASE,
  //   synchronize: true,
  //   entities: [GuildConfiguration, Membership, Payment],
  //   charset: 'utf8mb4',
  // })
  await AppDataSource.initialize()
  .then(() => {
    const connection_time = new Date().getTime() - connection_start;console.log((chalk.green(' - ✔')),'Connected to the database successfully.',(chalk.yellow(` (${connection_time}ms)`)));})
  .catch((error) => {console.log((chalk.red(' - ✖',error)));});

  // client.prefix = config.prefix || client.prefix;
  const configRepo = AppDataSource.getRepository(GuildConfiguration);
  const guildConfigs = await configRepo.find();
  const configs = new Collection<string, GuildConfiguration>();
  guildConfigs.forEach((config) => configs.set(config.guildId, config));

  client.configs = configs;
  // console.log(client.configs);

  const commands = {
    slashCommands: new slashCommands(),
    buttons: new buttons(),
    modals: new modals(),
    selectMenu: new selectMenu()
  };
  client.on('interactionCreate', async (interaction) => {
    // SlashCommand
    if(interaction.isChatInputCommand() && !externalCommands.slashCommands.some(c=>c==interaction.commandName)){ commands.slashCommands.slashCommands(interaction, client); };
    // Button
    if(interaction.isButton()){ commands.buttons.buttons(interaction, client); };
    // ModalSubmit
    if(interaction.isModalSubmit()){ commands.modals.modals(interaction, client); };
    // SelectMenu
    if(interaction.isAnySelectMenu() ||
          interaction.isRoleSelectMenu() ||
          interaction.isUserSelectMenu() ||
          interaction.isStringSelectMenu() ||
          interaction.isChannelSelectMenu() ||
          interaction.isMentionableSelectMenu()){ commands.selectMenu.selectMenu(interaction, client) };
  });
  client.on('ready', async () => {
    const { start_login } = require('./index');
      
    const time_login = new Date().getTime() - start_login;
    console.log((chalk.green(' - ✔')),`I'm ${chalk.greenBright(client.user?.displayName)} has logged in.`,(chalk.yellow(` (${time_login}ms)`)));
    client.user?.setActivity({ name: `yumistack.net | /help`, type: ActivityType.Playing });
  
    try{
      new auditLogEvents().events(client);
      new botEvents().events(client);
      new events().events(client);
    }catch(error){
      console.error(`${chalk.red(`- ✖ Error:`)} ${error}`);
    };

    // if(client.user?.id == '1210178730836893719'){ webStatus() };
    if(client.user?.id == '1210178730836893719'){ status.status(client) };

    const time_guild = new Date().getTime();
    let guilds;
    try{
      guilds = await client.guilds.fetch();
      guilds.forEach(async(g)=>{
        const guildConfigRepository = AppDataSource.getRepository(GuildConfiguration);
        const config = await guildConfigRepository.findOne({ where: { guildId: g.id } });
        if(!config){
          const newConfig = guildConfigRepository.create({
            guildId: g.id,
          });
          await guildConfigRepository.save(newConfig);
        };
      });
    }catch(error){
      throw error
    }finally{
        console.log((chalk.green(' - ✔')),`Guild data loaded successfully. Total guilds: ${guilds?.size || 0}`,(chalk.yellow(` (${new Date().getTime() - time_guild}ms)`)));
    };

    // console.log('Loading...');
    // let lastMem = process.memoryUsage().heapUsed;
    // let lastTime = Date.now();
    // function checkMemoryChange() {
    //   const now = Date.now();
    //   const current = process.memoryUsage().heapUsed;
    //   const diff = current - lastMem;
    //   const timeDiff = (now - lastTime) / 1000;
    
    //   const changePerSec = diff / timeDiff;
    
    //   const absChange = Math.abs(changePerSec);
    //   const isIncrease = changePerSec >= 0;
    
    //   const value =
    //     absChange > 1024 * 1024
    //       ? `${(absChange / 1024 / 1024).toFixed(2)} MB/s`
    //       : `${(absChange / 1024).toFixed(0)} KB/s`;
    
    //   const colored = isIncrease ? chalk.yellow(`+${value}`) : chalk.green(`-${value}`);
    
    //   lastMem = current;
    //   lastTime = now;
    
    //   return colored;
    // };
    // setInterval(() => {
    //   let messagesSize = 0;

    //   client.channels.cache.forEach(channel => {
    //     if (channel.isTextBased()) {
    //       messagesSize += channel.messages.cache.size;
    //     }
    //   });

    //   const toMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(3);
    //   const mem = process.memoryUsage();

    //   const output =
    //     `Guilds: ${chalk.yellow(client.guilds.cache.size)} | ` +
    //     `Channels: ${chalk.yellow(client.channels.cache.size)} | ` +
    //     `Users: ${chalk.yellow(client.users.cache.size)} | ` +
    //     `Messages: ${chalk.yellow(messagesSize)} | ` +
    //     `Heap Used: ${chalk.yellow(toMB(mem.heapUsed) + ' MB')} ${checkMemoryChange()}`
    //   ;
    //   readline.moveCursor(process.stdout, 0, -1);
    //   readline.clearLine(process.stdout, 0);
    //   readline.cursorTo(process.stdout, 0);
    //   console.log(chalk.green(' - ✔'), output);
    // }, 1000);
  });
  client.on('disconnect', () => {
    console.log(chalk.red(`- ✖`),'Bot disconnected. Attempting to reconnect...');
  });
  client.on('reconnecting', () => {
    console.log(chalk.yellow(`- ⏺`),'Bot is reconnecting...');
  });

  // await registerCommands(client, '../commands');
  // await registerEvents(client, '../events');

  const start_login = new Date().getTime();
  module.exports = { start_login };

  await client.login(process.env.IS_DEV === 'true' ? process.env.BOT_TOKEN2 : process.env.BOT_TOKEN);
})();