import {
  mnemonicToSecretKey,
  generateAccount,
  getApplicationAddress,
} from "algosdk";
import * as dotenv from "dotenv";

dotenv.config();
const ADMIN_MNEMONIC = String(process.env.ADMIN_MNEMONIC);
const APP_ID = Number(process.env.APP_ID);
export const user = mnemonicToSecretKey(ADMIN_MNEMONIC);
export const player = mnemonicToSecretKey(
  "tuna task minimum either please faculty sport regret seven motor hard hold diary flight distance around carry legend alpha budget decorate office chuckle absent rough"
);
export const appId = APP_ID;
export const appAddr = getApplicationAddress(appId);
export const randomnessBeaconContract = 110096026;
