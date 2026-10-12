require('dotenv').config();
import { ActivityType, CacheType, IntentsBitField, Interaction } from "discord.js";
import DiscordClient from "./client/client";
import { externalCommands } from ".";


const client = new DiscordClient({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.MessageContent,
      IntentsBitField.Flags.DirectMessages,
      IntentsBitField.Flags.GuildModeration,
      IntentsBitField.Flags.MessageContent,
    ],
    rest: {
      timeout: 60000,
    }
});
function exCM(interaction: Interaction<CacheType>, ex: typeof externalCommands): boolean {
  if(interaction.isChatInputCommand()){
    return ex.slashCommands.includes(interaction.commandName);
  }

  if(interaction.isButton()){
    return ex.buttons.some(id => interaction.customId.startsWith(id));
  }

  if(interaction.isModalSubmit()){
    return ex.modals.some(id => interaction.customId.startsWith(id));
  }

  if(interaction.isAnySelectMenu()){
    return ex.selectMenu.some(id => interaction.customId.startsWith(id));
  }

  return false;
};

(async () => {

const message = 'Bot is temporarily closed for maintenance.';
client.on('interactionCreate', async(interaction) => {
  if(exCM(interaction, externalCommands))return;
  if(interaction.isRepliable()){
    await interaction.reply({ content: message, ephemeral: true });
  }
});
client.on('ready', async () => {
  console.log('Bot is Ready!');
  client.user?.setActivity({ name: message, type: ActivityType.Custom });
});


await client.login(process.env.BOT_TOKEN);
})();