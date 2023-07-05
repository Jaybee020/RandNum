import {
  decodeUint64,
  encodeAddress,
  generateAccount,
  secretKeyToMnemonic,
  waitForConfirmation,
} from "algosdk";
import {
  checkAllPlayersWin,
  decodeTxReference,
  endCurrentAndCreateNewGame,
  getCurrentGameParam,
  getLottoPayTxn,
  getUserLottoHistory,
} from "../server/helpers";
import {
  MODE,
  appAddr,
  appId,
  player,
  randomnessBeaconContract,
  user,
} from "./config";
import { LottoGameArgsDecoder } from "./decode";
import {
  call,
  changeCurrentGameNumber,
  checkUserWinLottery,
  enterCurrentGame,
  generateRandomNumber,
  getGameParams,
  getGeneratedLuckyNumber,
  getUserGuessNumber,
  initializeGameParams,
  putLuckyNumber,
  resetGameParams,
} from "./lottoCall";
import {
  algodClient,
  checkUserOptedIn,
  getTransactionReference,
  getAppCallTransactions,
  getUserTransactionstoApp,
  getUserTransactionstoAppBetweenRounds,
  sendAlgo,
  submitTransaction,
  checkContractOptedInToAsset,
} from "./utils";
import mongoose from "mongoose";

(async () => {
  //   // const data = await getLottoPayTxn();
  //   // console.log(data?.receivedTxns);
  // await sendAlgo(user, appAddr, 0.5e6);
  //   // await call(user, appId, "generate_lucky_number", [randomnessBeaconContract]);
  // const ticketingStart = Math.round(Date.now() / 1000 + 200);
  // const ticketingDuration = 960;
  // const withdrawalStart = ticketingStart + ticketingDuration + 1000;
  // const ticketFee = 2e6;
  // const success = await initializeGameParams(
  //   user.addr,
  //   BigInt(ticketingStart),
  //   ticketingDuration,
  //   ticketFee,
  //   2,
  //   100000,
  //   2,
  //   appAddr,
  //   BigInt(withdrawalStart),
  //   10458941
  // );
  // if (!success || !success.txns) {
  //   return;
  // }
  // console.log(success.txns);
  // const signedtxns = success.txns?.map((txn) => txn.signTxn(user.sk));
  // const { txId } = await algodClient.sendRawTransaction(signedtxns).do();
  // await waitForConfirmation(algodClient, txId, 1000);
  // console.log(txId);
})();

// change method from optin to applcall
(async () => {
  // await sendAlgo(user, player.addr, 5e6);
  // const txns = await enterCurrentGame(player.addr, 1000, 2e6);
  // const signedtxns = txns.map((txn) => txn.signTxn(player.sk));
  // const { txId } = await algodClient.sendRawTransaction(signedtxns).do();
  // await waitForConfirmation(algodClient, txId, 1000);
  // console.log(txId);
  // const txns1 = await enterCurrentGame(user.addr, 1000, 2e6, 10458941);
  // const signedtxns1 = txns1.map((txn) => txn.signTxn(user.sk));
  // const { txId1 } = await algodClient.sendRawTransaction(signedtxns1).do();
  // await waitForConfirmation(algodClient, txId1, 1000);
  // console.log(txId1);
})();

(async () => {
  // const data = await generateRandomNumber();
  // console.log(data);
  // const data = await getGameParams();
  // console.log("game Params", data);
  // const res = await getGeneratedLuckyNumber();
  // console.log("lucky no", res);
  // const res2 = await getUserGuessNumber(player.addr);
  // console.log("user guess", res2);
  // const res2 = await putLuckyNumber();
  // console.log(res2);
  // const res2 = await getTransaction(
  //   "LQV7MKC5S6K5WGNFH6G4APZBKL2PGGERU75LINTQIMQEVRSRSE6Q"
  // );
  // const res3 = await checkUserWinLottery(user.addr, 10458941);
  // console.log(res3);
  // const res4 = await resetGameParams(appAddr, user.addr, user.addr, 10458941);
  // console.log(res4);
  // console.log(await getTimeStamp());
})();

(async () => {
  const data = await getCurrentGameParam();
  console.log(data);
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
  //   30808137
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
  // const data1 = await getAppCallTransactions(appId);
  // console.log(data1);
  // const uri =
  //   MODE == "PRODUCTIONh"
  //     ? String(process.env.MONGO_CONNECTION_STRING)
  //     : "mongodb://localhost:27017/RandNum";
  // mongoose
  //   .connect(uri, {})
  //   .then(() => {
  //     console.log("Connected to the database");
  //   })
  //   .catch((err) => {
  //     console.error("Couldn'to connect to database");
  //   });
  // const userLottoInteractions = await getUserLottoHistory(user.addr);
  // console.log(userLottoInteractions["-1"]);
  // const assets = [0, 10458941];
  // const assetindex = Math.floor(Math.random() * 10) % 2;
  // console.log("asset used is ", assets[assetindex]);
  // const data = await endCurrentAndCreateNewGame(
  //   undefined,
  //   undefined,
  //   undefined,
  //   undefined,
  //   undefined,
  //   undefined,
  //   undefined,
  //   undefined,
  //   assets[1]
  // );
  // console.log(
  //   `New Game status:${data.newGame.status}. New Game Txn Length:${data.newGame.txns?.length}`
  // );
  // if (data.newGame.status) {
  //   const initGameTxns = data.newGame.txns;
  //   if (initGameTxns && initGameTxns.length > 0) {
  //     try {
  //       const signed = initGameTxns.map((txn) => txn.signTxn(user.sk));
  //       const { txId } = await algodClient.sendRawTransaction(signed).do();
  //       await waitForConfirmation(algodClient, txId, 1000);
  //       console.log("Created new Game");
  //     } catch (error: any) {
  //       console.log(error.message);
  //       console.error("Could not create a new game because txn failed");
  //     }
  //   }
  // }
  // const value = Buffer.from(
  //   data[data.length - 1]["application-transaction"]["application-args"][1],
  //   "base64"
  // ).toString();
  // console.log(value);
  // console.log(player.addr);
  // const res = await checkContractOptedInToAsset(10458941);
  // console.log(res);
  // await decodeTxReference(
  //   "KCZPRHPWUCUQXUW43H26WSB5ONI3PZNKEBAGSSZO3WTLIVKPYNQQ"
  // );
  // const appBalance = await algodClient.accountInformation(appAddr).do();
  // const ticketFee = (await getCurrentGameParam()).ticketFee;
  // console.log(ticketFee);
  // const txns = await enterCurrentGame(player.addr, 50, BigInt(ticketFee));
  // const signedtxns = txns.map((txn) => txn.signTxn(player.sk));
  // const { txId } = await algodClient.sendRawTransaction(signedtxns).do();
  // await waitForConfirmation(algodClient, txId, 1000);
  // console.log(txId);
  // const uri =
  //   MODE == "PRODUCTIONh"
  //     ? String(process.env.MONGO_CONNECTION_STRING)
  //     : "mongodb://localhost:27017/RandNum";
  // mongoose
  //   .connect(uri, {})
  //   .then(() => {
  //     console.log("Connected to the database");
  //   })
  //   .catch((err) => {
  //     console.error("Couldn'to connect to database");
  //   });
  // await checkAllPlayersWin();
})();
