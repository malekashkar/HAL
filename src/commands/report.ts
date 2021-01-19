import { stripIndents } from "common-tags";
import { Message, TextChannel } from "discord.js";
import Command from ".";
import config from "../config";
import { Report, ReportModel } from "../models/report";
import { ScammerModel } from "../models/scammer";
import { UserModel } from "../models/user";
import { checkAdmin, getMojangProfile } from "../utils";
import confirmation from "../utils/confirmation";
import embeds from "../utils/embeds";
import { imageQuestion, question, questionOption } from "../utils/question";

export default class ReportCommand extends Command {
  cmdName = "report";
  description = "Report a user for scamming you or others.";

  async run(message: Message) {
    const scammerData = await ScammerModel.findOne({
      userId: message.author.id,
    });
    if (scammerData)
      return message.channel.send(
        embeds.error(
          `${message.author} is currently on the scammer list. You are not allowed to create reports as a scammer!`
        )
      );

    const ingameNameQuestion = await question(
      `What is the IGN of the scammer?`,
      message
    );
    if (!ingameNameQuestion) return;

    const mojangProfile = await getMojangProfile(ingameNameQuestion.content);
    if (!mojangProfile)
      return message.channel.send(
        embeds.error(
          `The Minecaft name **${ingameNameQuestion.content}** does not exist. Please try again!`
        )
      );

    const userIdQuestion = await questionOption(
      `Can you provide the scammers Discord User ID?`,
      `What is the scammer's Discord User ID?`,
      message
    );

    let userId: string = null;
    if (userIdQuestion) {
      const user = this.client.users.resolve(userIdQuestion.content);
      if (!user)
        return message.channel.send(
          embeds.error(
            `The Discord User ID **${userIdQuestion}** does not exist. Please try again!`
          )
        );
      userId = user.id;
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
            `**${mojangProfile.name}'s** discord has been found and set on his scammer profile!`
          )
        );
      }
    }

    const admin = checkAdmin(userId, this.client);
    const adminUser = await UserModel.findOne({ ingameUuid: mojangProfile.id });
    if (admin || adminUser)
      return message.channel.send(
        embeds.error(
          stripIndents`You may not report a member of the **${config.name}** staff team.
          Contact administrators if inquiry is serious.`
        )
      );

    const reason = await question(
      `What is your reason for adding **${mojangProfile.name}** to the scammer list?`,
      message
    );
    if (!reason) return;

    const proofQuestion = await imageQuestion(
      `Attach one image with proof of the scam to your next message.`,
      message
    );
    if (!proofQuestion) return;

    const confirm = await confirmation(
      stripIndents`Are you sure you would like report **${
        mojangProfile.name
      }** for scamming?
      
      Username: ${mojangProfile.name}
      UUID: ${mojangProfile.id}
      Discord ID: ${userId || "Not Provided"}
      Reason: ${reason.content}`,
      message
    );

    if (confirm) {
      const reportsChannel = this.client.guilds
        .resolve(config.mainGuild)
        .channels.resolve(config.reportsChannel) as TextChannel;
      const reportMessage = await reportsChannel.send(
        embeds
          .normal(
            `Scam Report`,
            `**${message.author.username}** reported **${mojangProfile.name}** for **${reason.content}**.`
          )
          .setImage(proofQuestion)
      );

      await ReportModel.create(
        new Report(
          userId,
          mojangProfile.name,
          mojangProfile.id,
          reason.content,
          reportMessage.id
        )
      );

      reportMessage.react("✅");
      reportMessage.react("❌");
    }
  }
}
