import { Message } from "discord.js";
import Command from ".";
import embeds from "../utils/embeds";

import fs from "fs";
import path from "path";

export default class GuidelineCommand extends Command {
  cmdName = "guideline";
  description = "Check the guildelines for valid reports.";
  aliases = ["guidelines"];

  async run(message: Message) {
    const guidelineFile = path.join(
      __dirname,
      "..",
      "..",
      "storage",
      "guidelines.txt"
    );
    const guidelinesText = fs.readFileSync(guidelineFile, "utf-8");

    return message.channel.send(
      embeds
        .normal(`Report Guidelines`, guidelinesText)
        .setFooter(`Trade at your own risk.`)
    );
  }
}
