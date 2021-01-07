import { logger } from "@typegoose/typegoose/lib/logSettings";
import Event, { EventNameType } from ".";

export default class Started extends Event {
  eventName: EventNameType = "ready";

  async handle() {
    logger.info("BOT", "The bot has started!");
  }
}
