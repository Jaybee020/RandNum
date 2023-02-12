import {
  mnemonicToSecretKey,
  generateAccount,
  getApplicationAddress,
} from "algosdk";
import * as dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();
const ADMIN_MNEMONIC = String(process.env.ADMIN_MNEMONIC);
const APP_ID = Number(process.env.APP_ID);
export const user = mnemonicToSecretKey(ADMIN_MNEMONIC);
export const player = mnemonicToSecretKey(
  "tuna task minimum either please faculty sport regret seven motor hard hold diary flight distance around carry legend alpha budget decorate office chuckle absent rough"
);
export const appId = APP_ID;
export const appAddr = getApplicationAddress(APP_ID);
export const randomnessBeaconContract = 110096026;

export async function initRedis() {
  const client = createClient({
    // url: `redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_URL}:${REDIS_PORT}`, //comment out if not in production
  });

  client.on("error", (err) => console.log("Redis Client error"));
  await client.connect();
  return client;
}
