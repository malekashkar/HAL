import { stripIndents } from "common-tags";
import { Message } from "discord.js";
import Command from ".";
import { Scammer, ScammerModel } from "../models/scammer";
import { UserModel } from "../models/user";
import { getMojangProfile, mcNameValidation } from "../utils";
import confirmation from "../utils/confirmation";
import embeds from "../utils/embeds";
import { question, questionOption } from "../utils/question";

export default class AddScammerCommand extends Command {
  cmdName = "addscammer";
  description = "Add scammers to the scammer list.";
  aliases = ["as"];
  adminPerm = true;

  async run(message: Message, args: string[]) {
    let ingameName = args[0];
    if (!ingameName) {
      const ingameNameQuestion = await question(
        `What is the scammer's IGN?`,
        message
      );
      if (ingameNameQuestion) ingameName = ingameNameQuestion.content;
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

    const scammerData = await ScammerModel.findOne({
      ingameUuid: mojangProfile.id,
    });
    if (scammerData)
      return message.channel.send(
        embeds.error(
          `The scammer you are trying to register is already on the list of scammers.`
        )
      );

    let userId = args[1];
    if (!userId) {
      const userIdQuestion = await questionOption(
        `Can you provide the scammers Discord User ID?`,
        `What is the scammer's Discord User ID?`,
        message
      );

      userId = null;
      if (userIdQuestion) {
        const user = this.client.users.resolve(userIdQuestion.content);
        if (!user)
          return message.channel.send(
            embeds.error(
              `The Discord User ID ${userIdQuestion} does not exist. Please try again!`
            )
          );
        userId = user.id;
      }
    }
    if (!userId) {
      const userData = await UserModel.findOne({
        ingameUuid: mojangProfile.id,
      });
      if (userData) {
        userId = userData.userId;
        message.channel.send(
          embeds.normal(
            `Discord Found`,
            `**${ingameName}'s** discord has been found and set on his scammer profile!`
          )
        );
      }
    }

    let reason = args[2];
    if (!reason) {
      const reasonQuestion = await question(
        `What is your reason for adding **${mojangProfile.name}** to the scammer list?`,
        message
      );
      if (reasonQuestion) reason = reasonQuestion.content;
    }

    const confirm = await confirmation(
      stripIndents`Are you sure you would like to add **${
        mojangProfile.name
      }** to the scammers list?
      
      Username: ${mojangProfile.name}
      UUID: ${mojangProfile.id}
      Discord ID: ${userId || "Not Provided"}
      Reason: ${reason}`,
      message
    );

    if (confirm) {
      const scammer = await ScammerModel.create(
        new Scammer(userId, mojangProfile.name, mojangProfile.id, reason)
      );

      return message.channel.send(
        embeds.normal(
          `Scammer Added`,
          `**${mojangProfile.name}** has been added to the scammer list. Scammer ID #${scammer.id}`
        )
      );
    }
  }
}
