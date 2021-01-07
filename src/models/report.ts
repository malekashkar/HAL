import { getModelForClass, plugin, prop } from "@typegoose/typegoose";
import { AutoIncrementID } from "@typegoose/auto-increment";

@plugin(AutoIncrementID, { field: "id", startAt: 1 })
export class Report {
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
  reportedUserLowercaseUsername: string;

  @prop()
  reportMessageId: string;

  constructor(
    userId: string,
    ingameName: string,
    ingameUuid: string,
    reason: string,
    reportMessageId: string
  ) {
    this.userId = userId;
    this.ingameName = ingameName;
    this.ingameUuid = ingameUuid;
    this.reason = reason;
    this.reportMessageId = reportMessageId;
    this.reportedUserLowercaseUsername = ingameName.toLowerCase();
  }
}

export const ReportModel = getModelForClass(Report);
