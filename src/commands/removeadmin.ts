import { Message } from "discord.js";
import Command from ".";
import { AdminModel } from "../models/admin";
import confirmation from "../utils/confirmation";
import embeds from "../utils/embeds";
import { question } from "../utils/question";

export default class AddAdminCommand extends Command {
  cmdName = "removeadmin";
  description = "Remove an admin from the admin list.";
  adminPerm = true;

  async run(message: Message, args: string[]) {
    let user = message.mentions.users.first();
    if (!user) {
      const userQuestion = await question(
        `Tag the user you would like to remove admin permissions from.`,
        message
      );
      if (!userQuestion) return;
      user = userQuestion.mentions.users.first();
    }
    if (!user) return;

    const confirm = await confirmation(
      `Are you sure you would like to remove ${user}'s admin permissions?`,
      message
    );
    if (confirm) {
      await AdminModel.deleteOne({ userId: user.id });
      return message.channel.send(
        embeds.normal(
          `Admin Removed`,
          `${user} no longer has their admin permissions.`
        )
      );
    }
  }
}
