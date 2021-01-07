import { Message } from "discord.js";
import Command from ".";
import { AdminModel } from "../models/admin";
import embeds from "../utils/embeds";
import Paginator from "../utils/pagecord";

export default class ListAdminCommand extends Command {
  cmdName = "listadmin";
  description = "List all the bot's admins.";
  aliases = ["listadmins", "adminlist"];
  adminPerm = true;

  async run(message: Message, args: string[]) {
    const page = !isNaN(parseInt(args[0])) ? parseInt(args[0]) : 0;
    const adminAmount = await AdminModel.countDocuments();
    const pageCount = Math.ceil(adminAmount / 20);

    if (!adminAmount)
      return message.channel.send(
        embeds.error(
          `There aren't any admins on the on file currently. Please try again later!`
        )
      );

    const paginator = new Paginator(
      message,
      pageCount,
      async (pageIndex) => {
        const admins = await AdminModel.find()
          .skip(pageIndex * 20)
          .limit(20)
          .exec();

        const description = admins
          .map((admin, i) => `${pageIndex * 20 + 1 + i}. <@${admin.userId}>`)
          .join("\n");

        return embeds
          .normal(`Admin List`, description)
          .setFooter("Page PAGE of TOTAL_PAGES");
      },
      page && page <= pageCount ? page - 1 : 0
    );

    await paginator.start();
  }
}
