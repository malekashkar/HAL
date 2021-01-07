import { Message } from "discord.js";
import Command from ".";
import { ScammerModel } from "../models/scammer";
import confirmation from "../utils/confirmation";
import embeds from "../utils/embeds";
import { question } from "../utils/question";

export default class RemoveScammerCommand extends Command {
  cmdName = "removescammer";
  description = "Remove scammers from the scammer list.";
  aliases = ["rs"];
  adminPerm = true;

  async run(message: Message, args: string[]) {
    let query = args[0] || message.mentions.users?.first()?.id;
    if (!query) {
      const queryQuestion = await question(
        `What is the **Discord Tag/Discord ID**, **IGN**  or **UUID** of the scammer?`,
        message
      );
      if (queryQuestion && queryQuestion.mentions?.users?.size) {
        query = queryQuestion.mentions?.users?.first()?.id;
      } else if (queryQuestion) {
        query = queryQuestion.content.toLowerCase();
      }
    }

    const scammerData = await ScammerModel.findOne({
      $or: [
        { userId: query },
        { lowerCaseIngameUsername: query.toLowerCase() },
        { ingameUuid: query },
      ],
    });
    if (scammerData) {
      const confirm = await confirmation(
        `Are you sure you would like to remove **${scammerData.ingameName}** from the scammers list?`,
        message
      );
      if (confirm) {
        await scammerData.deleteOne();
        return message.channel.send(
          embeds.normal(
            `Scammer Removed`,
            `**${scammerData.ingameName}** has been removed from the scammer list. Scammer ID #${scammerData.id}`
          )
        );
      }
    } else {
      return message.channel.send(
        embeds.error(`The user you are searching for is not a scammer.`)
      );
    }
  }
}
