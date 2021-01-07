import { Message } from "discord.js";
import Command from ".";
import { ScammerModel } from "../models/scammer";
import embeds from "../utils/embeds";
import Paginator from "../utils/pagecord";

export default class ListScammersCommand extends Command {
  cmdName = "listscammers";
  description = "List all of the scammers on the scammers list.";
  aliases = ["ls"];

  async run(message: Message, args: string[]) {
    const page = !isNaN(parseInt(args[0])) ? parseInt(args[0]) : 0;
    const scammerAmount = await ScammerModel.countDocuments();
    const pageCount = Math.ceil(scammerAmount / 20);

    if (!scammerAmount)
      return message.channel.send(
        embeds.error(
          `There aren't any scammers on the scammer list currently. Please try again later!`
        )
      );

    const paginator = new Paginator(
      message,
      pageCount,
      async (pageIndex) => {
        const scammers = await ScammerModel.find()
          .skip(pageIndex * 20)
          .limit(20)
          .exec();

        const description = scammers
          .map(
            (scammer, i) =>
              `${pageIndex * 20 + 1 + i}. **${scammer.ingameName}** \`#${scammer.id}\` (${
                scammer.userId || `Discord Not Provided`
              })`
          )
          .join("\n");

        return embeds
          .normal(`Scammer List`, description)
          .setFooter("Page PAGE of TOTAL_PAGES");
      },
      page && page <= pageCount ? page - 1 : 0
    );

    await paginator.start();
  }
}
