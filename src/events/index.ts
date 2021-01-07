import { ClientEvents } from "discord.js";

import Client from "..";

export type EventNameType = keyof ClientEvents;

export default abstract class Event {
  client: Client;
  disabled = false;
  abstract eventName: EventNameType;

  constructor(client: Client) {
    this.client = client;
  }

  abstract handle(...args: unknown[]): Promise<void>;
}
