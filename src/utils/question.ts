import { Message } from "discord.js";
import embeds from "./embeds";
import config from "../config";

export async function imageQuestion(question: string, message: Message) {
  const questionMessage = await message.channel.send(
    `${message.author}`,
    embeds.question(question)
  );
  const collected = await message.channel.awaitMessages(
    (m: Message) =>
      m.author.id === message.author.id && m.attachments.size === 1,
    { time: config.questionTime, max: 1, errors: ["time"] }
  );
  if (collected.size) {
    if (questionMessage.deletable) questionMessage.delete();
    if (collected.first()?.deletable) collected.first().delete();
    return collected.first().attachments.first().url;
  } else {
    return false;
  }
}

export async function questionUserTag(question: string, message: Message) {
  const questionMessage = await message.channel.send(
    `${message.author}`,
    embeds.question(question)
  );
  const collected = await message.channel.awaitMessages(
    (m: Message) =>
      m.author.id === message.author.id && m.mentions.users.size === 1,
    { time: config.questionTime, max: 1, errors: ["time"] }
  );
  if (collected.size) {
    if (questionMessage.deletable) questionMessage.delete();
    if (collected.first()?.deletable) collected.first().delete();
    return collected.first();
  } else {
    return false;
  }
}

export async function question(question: string, message: Message) {
  const questionMessage = await message.channel.send(
    `${message.author}`,
    embeds.question(question)
  );
  const collected = await message.channel.awaitMessages(
    (m: Message) => m.author.id === message.author.id,
    { time: config.questionTime, max: 1, errors: ["time"] }
  );
  if (collected.size) {
    if (questionMessage.deletable) questionMessage.delete();
    if (collected.first()?.deletable) collected.first().delete();
    return collected.first();
  } else {
    return false;
  }
}

export async function questionOption(
  optionQuestion: string,
  question: string,
  message: Message
) {
  const reactionQuestionMessage = await message.channel.send(
    `${message.author}`,
    embeds.question(optionQuestion)
  );

  reactionQuestionMessage.react("✅");
  reactionQuestionMessage.react("❌");

  const rCollected = await reactionQuestionMessage.awaitReactions(
    (r, u) => u.id === message.author.id && ["✅", "❌"].includes(r.emoji.name),
    { max: 1, time: config.questionTime, errors: ["time"] }
  );

  if (rCollected.first()?.emoji?.name === "✅") {
    if (reactionQuestionMessage.deletable) reactionQuestionMessage.delete();

    const questionMessage = await message.channel.send(
      `${message.author}`,
      embeds.question(question)
    );

    const collected = await message.channel.awaitMessages(
      (m: Message) => m.author.id === message.author.id,
      { time: config.questionTime, max: 1, errors: ["time"] }
    );

    if (collected.size) {
      if (collected.first()?.deletable) collected.first().delete();
      if (questionMessage.deletable) questionMessage.delete();
      return collected.first();
    } else {
      return false;
    }
  } else {
    if (reactionQuestionMessage.deletable) reactionQuestionMessage.delete();
    return false;
  }
}
