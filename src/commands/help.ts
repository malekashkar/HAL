import { Message } from "discord.js";
import { Collection } from "discord.js";
import Command from ".";
import config from "../config";
import embeds from "../utils/embeds";
import { permissions } from "../events/handler";
import { stripIndents } from "common-tags";

export default class HelpCommand extends Command {
  cmdName = "help";
  description = "Get information on all the commands.";

  async run(message: Message) {
    const commands: Collection<string, Command> = new Collection();

    for (const command of this.client.commands) {
      if (!(await permissions(command[1], message.author, this.client))) continue;
      commands.set(command[0], command[1]);
    }

    const description = commands
      .map(
        (command) =>
          stripIndents`**${config.prefix}${command.cmdName}**${
            command.usage ? ` \`${command.usage}\`` : ``
          } ~ ${command.description}${
            command.aliases.length
              ? `\nAliases: ${command.aliases
                  .map((x) => `\`${config.prefix}${x}\``)
                  .join(" ")}`
              : ``
          }`
      )
      .join("\n\n");

    return message.channel.send(embeds.normal(`Help Menu`, description));
  }
}
