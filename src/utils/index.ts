import fetch from "node-fetch";
import Client from "..";
import config from "../config";

interface AccountInfo {
  name: string;
  id: string;
}

export async function getMojangProfile(username: string) {
  const request = await fetch(
    `https://api.mojang.com/users/profiles/minecraft/${username}`
  );
  if (request.status !== 200) return false;

  const response = await request.json();
  return response as AccountInfo;
}

export function mcNameValidation(name: string) {
  if (name.includes(" ")) return false;
  if (name.length >= 3 && name.length <= 16) {
    const re = new RegExp(/[^a-zA-Z0-9]/gm);
    const regexTest = re.test(name);
    if (regexTest) return false;
  } else {
    return false;
  }
  return true;
}

export function checkAdmin(userId: string, client: Client) {
  if (!userId) return false;
  const guild = client.guilds.resolve(config.mainGuild);
  const member = guild.members.resolve(userId);
  if (member.roles.cache.has(config.staffRole)) return true;
  return false;
}
