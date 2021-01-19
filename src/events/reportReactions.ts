import { MessageReaction, TextChannel, User } from "discord.js";
import Event, { EventNameType } from ".";
import config from "../config";
import { ReportModel } from "../models/report";
import { Scammer, ScammerModel } from "../models/scammer";
import { checkAdmin } from "../utils";
import embeds from "../utils/embeds";

export default class ReportReactions extends Event {
  eventName: EventNameType = "messageReactionAdd";

  async handle(reaction: MessageReaction, user: User) {
    if (user.bot) return;
    if (reaction.message.partial) await reaction.message.fetch();

    const message = reaction.message;
    if (message.guild.id === config.mainGuild) {
      const admin = checkAdmin(user.id, this.client);
      if (admin || config.owners.includes(user.id)) {
        const reportData = await ReportModel.findOne({
          reportMessageId: message.id,
        });
        if (reportData) {
          if (["❌", "✅"].includes(reaction.emoji.name)) {
            const logChannel = message.guild.channels.resolve(
              config.reportLogsChannel
            ) as TextChannel;

            if (reaction.emoji.name === "✅") {
              const scammerData = await ScammerModel.findOne({
                $or: [
                  {
                    ingameUuid: reportData.ingameUuid,
                  },
                ],
              });
              if (!scammerData) {
                if (message.deletable) message.delete();
                await reportData.deleteOne();
                const scammer = await ScammerModel.create(
                  new Scammer(
                    reportData.userId,
                    reportData.ingameName,
                    reportData.ingameUuid,
                    reportData.reason
                  )
                );

                logChannel.send(
                  embeds
                    .normal(
                      `Report Accepted`,
                      `**${scammer.ingameName}** has been added to the scammer list.
                    
                    Scammer ID #${scammer.id}
                    Reason: ${scammer.reason}`
                    )
                    .setFooter(`Proof provided below`)
                    .setImage(message.embeds[0].image.url)
                );
              }
            } else {
              if (message.deletable) message.delete();
              await reportData.deleteOne();

              logChannel.send(
                embeds.normal(
                  `Report Denied`,
                  `Report **#${reportData.id}** on **${reportData.ingameName}** has been denied.`
                )
              );
            }
          } else {
            await reportData.deleteOne();
          }
        }
      }
    }
  }
}
