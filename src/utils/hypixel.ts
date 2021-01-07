import fetch from "node-fetch";
import { config as dotenv } from "dotenv";

dotenv();

export async function getHypixelProfile(ingameUuid: string) {
  const request = await fetch(
    `https://api.hypixel.net/player?key=${process.env.HYPIXEL_API_KEY}&uuid=${ingameUuid}`
  );
  const response = await request.json();
  if (request.status !== 200) return false;
    return response;
}
