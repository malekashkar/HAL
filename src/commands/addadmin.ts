import { Message } from "discord.js";
import Command from ".";
import { Admin, AdminModel } from "../models/admin";
import { getMojangProfile, mcNameValidation } from "../utils";
import confirmation from "../utils/confirmation";
import embeds from "../utils/embeds";
import { question, questionUserTag } from "../utils/question";

export default class AddAdminCommand extends Command {
  cmdName = "addadmin";
  description = "Add an admin to the admin list.";
  ownerPerm = true;
  aliases = ["adminadd"];

  async run(message: Message, args: string[]) {
    let ingameName = args[1];
    if (!ingameName) {
      const ingameNameQuestion = await question(
        `What is the user's IGN?`,
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

    const ingameAdminData = await AdminModel.findOne({
      ingameUuid: mojangProfile.id,
    });
    if (ingameAdminData)
      return message.channel.send(
        embeds.error(
          `There's already an admin registered with the IGN **${ingameAdminData.ingameName}**.`
        )
      );

    let user =
      message.mentions.users.first() || message.mentions.members.first();
    if (!user) {
      const userQuestion = await questionUserTag(
        `Tag the user you would like to give admin permissions to.`,
        message
      );
      if (!userQuestion) return;
      user =
        userQuestion.mentions.users.first() || message.mentions.members.first();
    }

    const discordAdminData = await AdminModel.findOne({
      ingameUuid: mojangProfile.id,
    });
    if (discordAdminData)
      return message.channel.send(
        embeds.error(
          `There's already an admin registered with the discord <@${discordAdminData.userId}>.`
        )
      );

    const confirm = await confirmation(
      `Are you sure you would like to give admin permissions to ${user}?`,
      message
    );
    if (confirm) {
      await AdminModel.create(
        new Admin(user.id, mojangProfile.name, mojangProfile.id)
      );
      return message.channel.send(
        embeds.normal(
          `Admin Added`,
          `${user} has been given admin permissions.`
        )
      );
    }
  }
}
