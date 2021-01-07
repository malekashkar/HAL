import { Message } from "discord.js";
import Command from ".";
import { UserModel, User } from "../models/user";
import { getMojangProfile, mcNameValidation } from "../utils";
import embeds from "../utils/embeds";
import { getHypixelProfile } from "../utils/hypixel";
import { question } from "../utils/question";

export default class LinkCommand extends Command {
  cmdName = "link";
  description = "Link your Minecraft account to your Discord account.";

  async run(message: Message, args: string[]) {
    let ingameName = args[0];
    if (!ingameName) {
      const ingameNameQuestion = await question(
        `What is your ingame name?`,
        message
      );
      if (!ingameNameQuestion) return;
      ingameName = ingameNameQuestion.content;
    }

    if (!mcNameValidation(ingameName))
      return message.channel.send(
        embeds.error(
          `The name **${ingameName}** is not a possible Minecraft name.`
        )
      );

    const mojangProfile = await getMojangProfile(ingameName);
    if (!mojangProfile)
      return message.channel.send(
        embeds.error(
          `The Minecaft name **${ingameName}** does not exist. Please try again!`
        )
      );

    const hypixelProfile = await getHypixelProfile(mojangProfile.id);
    if (!hypixelProfile) return;

    const hypixelSocialDiscord =
      hypixelProfile.player?.socialMedia?.links?.DISCORD;
    if (message.author.tag !== hypixelSocialDiscord) {
      return message.channel.send(
        embeds.error(
          `The Discord account linked to your Hypixel does not match ${message.author}'s information.`
        )
      );
    } else if (message.author.tag === hypixelSocialDiscord) {
      await UserModel.create(
        new User(message.author.id, mojangProfile.name, mojangProfile.id)
      );
      return message.channel.send(
        embeds.normal(
          `Account Linked`,
          `You have linked your Minecraft account to your Discord.`
        )
      );
    } else {
      return message.channel.send(
        embeds.error(
          `Please link your Discord account to your Hypixel account.`
        )
      );
    }
  }
}
