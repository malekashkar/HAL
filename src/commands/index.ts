import { Message } from "discord.js";
import Client from "..";

export type CooldownType = "COMMAND" | "ARGS";

export default abstract class Command {
  aliases?: string[] = [];
  disabled = false;
  usage = "";

  adminPerm: boolean = false;
  ownerPerm: boolean = false;

  client: Client;

  abstract cmdName: string;
  abstract description: string;

  constructor(client: Client) {
    this.client = client;
  }

  abstract run(_message: Message, _args: string[]): Promise<Message | void>;
}
