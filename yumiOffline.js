import { Client } from 'discord.js';
import chalk from 'chalk';

const client = new Client({ intents: [] });
(async()=>{
  client.on('clientReady', async()=>{
    console.log(chalk.blueBright.bold('[Discord]'), 'Logged in as', chalk.greenBright.bold(client.user?.displayName), 'is Ready!');
		client.user?.setActivity({ name: `💤 I'm sleeping`, type: 4 });
  });
	client.on('interactionCreate', async(i)=>{
		i.isRepliable() && i.reply({ content: `I'm in the process of improving.`, flags: 'Ephemeral' });
	});

  await client.login(process.env.BOT_TOKEN);
})();
