import logger from "../utils/logger";
import { Message, TextChannel, User } from "discord.js";
import Event, { EventNameType } from ".";
import config from "../config";
import { AdminModel } from "../models/admin";
import Command from "../commands";

export default class CommandHandler extends Event {
  eventName: EventNameType = "message";

  async handle(message: Message) {
    if (!(message.channel instanceof TextChannel) || message.author?.bot)
      return;

    try {
      const prefix = config.prefix;
      if (!prefix || message.content.indexOf(prefix) !== 0) return;

      const args = message.content
        .slice(prefix.length)
        .trim()
        .replace(/ /g, "\n")
        .split(/\n+/g);
      const command = args.shift().toLowerCase();

      for (const commandObj of this.client.commands.array()) {
        if (commandObj.disabled) return;
        if (
          commandObj.cmdName.toLowerCase() === command ||
          commandObj.aliases.map((x) => x.toLowerCase()).includes(command)
        ) {
          if (!(await permissions(commandObj, message.author))) return;

          commandObj
            .run(message, args)
            .catch((err) =>
              logger.error(`${command.toUpperCase()}_ERROR`, err)
            );
        }
      }
    } catch (err) {
      logger.error("COMMAND_HANDLER", err);
    }
  }
}

export async function permissions(command: Command, user: User) {
  if (command.ownerPerm) {
    if (!config.owners.includes(user.id)) return false;
  }
  if (command.adminPerm) {
    if (config.owners.includes(user.id)) return true;
    const admin = await AdminModel.findOne({ userId: user.id });
    if (!admin) return false;
  }
  return true;
}
