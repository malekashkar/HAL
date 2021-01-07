import { Message } from "discord.js";
import Command from ".";
import { ScammerModel } from "../models/scammer";
import embeds from "../utils/embeds";
import { question } from "../utils/question";

export default class ScammerCheckCommand extends Command {
  cmdName = "scammercheck";
  description = "Check if a user in your discord server is a scammer.";
  aliases = ["sc"];

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
        query = queryQuestion.content;
      }
      if (query.includes("-")) query = query.replace(/-/gm, "");
    }

    const scammerData = await ScammerModel.findOne({
      $or: [
        { userId: query },
        { lowerCaseIngameUsername: query.toLowerCase() },
        { ingameUuid: query },
      ],
    });
    if (scammerData) {
      return message.channel.send(
        embeds
          .normal(scammerData.ingameName, `Link to their NameMC Profile.`)
          .setURL(
            `https://namemc.com/profile/${scammerData.ingameUuid}?q=${scammerData.ingameUuid}`
          )
          .setThumbnail(
            `https://cdn.discordapp.com/attachments/435479782281707520/795000430714683412/cross3.png`
          )
          .setColor("RED")
          .setFooter(`Scammer ID # ${scammerData.id}`)
          .setAuthor(
            `Scammer Check`,
            `https://cdn.discordapp.com/icons/571681282652766208/a_2e7826b67fb2c2218f46c631118eb0cd.gif`
          )
          .addField(`This user is a scammer`, scammerData.reason)
          .addField(`Discord ID`, scammerData.userId || `Not provided.`)
      );
    } else {
      return message.channel.send(
        embeds
          .normal(
            `**${query}** has no scam history`,
            `There is a chance this user might not be trustworthy.`
          )
          .setColor("GREEN")
          .setAuthor(
            `Scammer Check`,
            `https://cdn.discordapp.com/icons/571681282652766208/a_2e7826b67fb2c2218f46c631118eb0cd.gif`
          )
          .setFooter(`Proceed at your own risk`)
      );
    }
  }
}
