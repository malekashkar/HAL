import { getModelForClass, prop } from "@typegoose/typegoose";

export class Admin {
  @prop({ unique: true })
  userId: string;

  @prop()
  ingameName: string;

  @prop()
  ingameUuid: string;

  @prop()
  lowercaseIngameName: string;

  constructor(userId: string, ingameName: string, ingameUuid: string) {
    this.userId = userId;
    this.ingameName = ingameName;
    this.ingameUuid = ingameUuid;
    this.lowercaseIngameName = ingameName.toLowerCase();
  }
}

export const AdminModel = getModelForClass(Admin);
