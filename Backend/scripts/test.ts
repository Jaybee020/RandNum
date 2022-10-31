import {
  decodeUint64,
  encodeAddress,
  generateAccount,
  secretKeyToMnemonic,
  waitForConfirmation,
} from "algosdk";
import { getUserLottoHistory } from "../server/helpers";
import { appAddr, appId, player, user } from "./config";
import { LottoGameArgsDecoder } from "./decode";
import {
  call,
  changeCurrentGameNumber,
  checkUserWinLottery,
  enterCurrentGame,
  generateRandomNumber,
  getGameParams,
  getGeneratedLuckyNumber,
  getTimeStamp,
  getUserGuessNumber,
  initializeGameParams,
  putLuckyNumber,
} from "./lottoCall";
import {
  algodClient,
  checkUserOptedIn,
  getTransaction,
  getAppCallTransactions,
  getUserTransactionstoApp,
  getUserTransactionstoAppBetweenRounds,
  sendAlgo,
} from "./utils";

// (async () => {
//   const ticketingStart = Math.round(Date.now() / 1000 + 200);
//   const ticketingDuration = 960;
//   const withdrawalStart = ticketingStart + 2000;
//   const ticketFee = 2e6;
//   const success = await initializeGameParams(
//     BigInt(ticketingStart),
//     ticketingDuration,
//     ticketFee,
//     BigInt(withdrawalStart)
//   );
//   console.log(success);
// })();

// change method from optin to applcall
// (async () => {
//   // await sendAlgo(user, player.addr, 5e6);
//   const txns = await enterCurrentGame(player.addr, 1000);
//   const signedtxns = txns.map((txn) => txn.signTxn(player.sk));
//   const { txId } = await algodClient.sendRawTransaction(signedtxns).do();
//   await waitForConfirmation(algodClient, txId, 1000);
//   console.log(txId);
//   const txns1 = await enterCurrentGame(user.addr, 1000);
//   const signedtxns1 = txns1.map((txn) => txn.signTxn(user.sk));
//   const { txId1 } = await algodClient.sendRawTransaction(signedtxns1).do();
//   await waitForConfirmation(algodClient, txId1, 1000);
//   console.log(txId1);
// })();

(async () => {
  // const data = await generateRandomNumber();
  // console.log(data);
  // const data = await getGameParams();
  // console.log(data);
  // const res = await getGeneratedLuckyNumber();
  // console.log(res);
  // const res2 = await getUserGuessNumber(player.addr);
  // console.log(res2);
  // const res2 = await putLuckyNumber();
  // console.log(res2);
  // const res2 = await getTransaction(
  //   "LQV7MKC5S6K5WGNFH6G4APZBKL2PGGERU75LINTQIMQEVRSRSE6Q"
  // );
  // const res3 = await checkUserWinLottery(player.addr);
  // console.log(res3);
  // console.log(await getTimeStamp());
})();

(async () => {
  // const txns = await changeCurrentGameNumber(player.addr, 500);
  // const signedtxns = txns.map((txn) => txn.signTxn(player.sk));
  // const { txId } = await algodClient.sendRawTransaction(signedtxns).do();
  // await waitForConfirmation(algodClient, txId, 1000);
  // console.log(txId);
  // await getUserTransactionstoApp(user.addr, appId);
  // const data = await getUserTransactionstoAppBetweenRounds(
  //   user.addr,
  //   appId,
  //   25098964,
  //   25118364
  // );
  // const decoder = new LottoGameArgsDecoder();
  // const filtered = data
  //   .filter((userTxn) =>
  //     decoder.encodedMethods.includes(
  //       userTxn["application-transaction"]["application-args"][0]
  //     )
  //   )
  //   .map((userTxn) => {
  //     const action = decoder.decodeMethod(
  //       userTxn["application-transaction"]["application-args"][0]
  //     );
  //     const value = decodeUint64(
  //       Buffer.from(
  //         userTxn["application-transaction"]["application-args"][1],
  //         "base64"
  //       ),
  //       "mixed"
  //     );
  //     return { action, value };
  //   });
  // console.log(filtered);
  // const decode = new LottoGameArgsDecoder();
  // console.log(decode.decodeMethod("5FeWqg=="));
  // const data = await getAppCallTransactions(appId);
  // console.log(data[data.length - 1]);
  const userLottoInteractions = await getUserLottoHistory(player.addr);
  console.log(userLottoInteractions);
  // const value = Buffer.from(
  //   data[data.length - 1]["application-transaction"]["application-args"][1],
  //   "base64"
  // ).toString();
  // console.log(value);
})();
