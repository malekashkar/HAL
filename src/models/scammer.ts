import { getModelForClass, plugin, prop } from "@typegoose/typegoose";
import { AutoIncrementID } from "@typegoose/auto-increment";

@plugin(AutoIncrementID, { field: "id", startAt: 1 })
export class Scammer {
  @prop()
  id: number;

  @prop()
  userId: string;

  @prop()
  ingameName: string;

  @prop()
  ingameUuid: string;

  @prop()
  reason: string;

  @prop()
  lowerCaseIngameUsername: string;

  constructor(
    userId: string,
    ingameName: string,
    ingameUuid: string,
    reason: string
  ) {
    this.userId = userId;
    this.ingameName = ingameName;
    this.ingameUuid = ingameUuid;
    this.reason = reason;
    this.lowerCaseIngameUsername = ingameName.toLowerCase();
  }
}

export const ScammerModel = getModelForClass(Scammer);
