import { CommandInteraction, ApplicationCommandData } from "discord.js";

export default abstract class BaseSlashCommand {
  abstract run(interaction: CommandInteraction): Promise<void>;

  toJSON(): ApplicationCommandData {
    throw new Error("Method not implemented.");
  }
}
