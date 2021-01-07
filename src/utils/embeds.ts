import { MessageEmbed } from "discord.js";
import config from "../config";
import ms from "ms";

export default class embeds {
  static error = function (error: string, title = "Error Caught") {
    const embed = new MessageEmbed()
      .setTitle(title)
      .setDescription(error)
      .setColor("RED")
      .setTimestamp();
    return embed;
  };

  static normal = function (title: string, description: string) {
    const embed = new MessageEmbed()
      .setTitle(title)
      .setDescription(description)
      .setColor("GREEN")
      .setTimestamp();
    return embed;
  };

  static question = function (question: string) {
    const embed = new MessageEmbed()
      .setTitle(question)
      .setFooter(
        `You have ${ms(
          config.questionTime
        )} to reply to the question above.`
      )
      .setColor("GREEN")
      .setTimestamp();
    return embed;
  };
}
