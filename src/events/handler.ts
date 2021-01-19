import logger from "../utils/logger";
import { Message, TextChannel, User } from "discord.js";
import Event, { EventNameType } from ".";
import config from "../config";
import Command from "../commands";
import { checkAdmin } from "../utils";
import Client from "..";
import { UserModel, User as DbUser } from "../models/user";
import embeds from "../utils/embeds";
import ms from "ms";

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
          if (!(await permissions(commandObj, message.author, this.client)))
            return;

          if (
            !config.owners.includes(message.author.id) ||
            !checkAdmin(message.author.id, this.client)
          ) {
            let userData = await UserModel.findOne({
              userId: message.author.id,
            });
            if (!userData)
              userData = await UserModel.create(new DbUser(message.author.id));

            if (
              userData.lastCommandTime - Date.now() <
              config.commandCooldown
            ) {
              message.channel.send(
                embeds.error(
                  `Please wait ${ms(
                    config.commandCooldown -
                      (userData.lastCommandTime - Date.now())
                  )} before you run a command again!`
                )
              );
              return;
            } else {
              userData.lastCommandTime = Date.now();
              await userData.save();
            }
          }

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

export async function permissions(
  command: Command,
  user: User,
  client: Client
) {
  if (command.ownerPerm) {
    if (!config.owners.includes(user.id)) return false;
  }
  if (command.adminPerm) {
    if (config.owners.includes(user.id)) return true;
    const admin = checkAdmin(user.id, client);
    if (!admin) return false;
  }
  return true;
}
