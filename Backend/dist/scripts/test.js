"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const algosdk_1 = require("algosdk");
const helpers_1 = require("../server/helpers");
const config_1 = require("./config");
const utils_1 = require("./utils");
const mongoose_1 = __importDefault(require("mongoose"));
(() => __awaiter(void 0, void 0, void 0, function* () {
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
}))();
// change method from optin to applcall
(() => __awaiter(void 0, void 0, void 0, function* () {
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
}))();
(() => __awaiter(void 0, void 0, void 0, function* () {
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
}))();
(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
    const uri = config_1.MODE == "PRODUCTIONh"
        ? String(process.env.MONGO_CONNECTION_STRING)
        : "mongodb://localhost:27017/RandNum";
    mongoose_1.default
        .connect(uri, {})
        .then(() => {
        console.log("Connected to the database");
    })
        .catch((err) => {
        console.error("Couldn'to connect to database");
    });
    const userLottoInteractions = yield (0, helpers_1.getUserLottoHistory)(config_1.user.addr);
    console.log(userLottoInteractions["-1"]);
    const assets = [0, 10458941];
    const assetindex = Math.floor(Math.random() * 10) % 2;
    console.log("asset used is ", assets[assetindex]);
    const data = yield (0, helpers_1.endCurrentAndCreateNewGame)(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, assets[1]);
    console.log(`New Game status:${data.newGame.status}. New Game Txn Length:${(_a = data.newGame.txns) === null || _a === void 0 ? void 0 : _a.length}`);
    if (data.newGame.status) {
        const initGameTxns = data.newGame.txns;
        if (initGameTxns && initGameTxns.length > 0) {
            try {
                const signed = initGameTxns.map((txn) => txn.signTxn(config_1.user.sk));
                const { txId } = yield utils_1.algodClient.sendRawTransaction(signed).do();
                yield (0, algosdk_1.waitForConfirmation)(utils_1.algodClient, txId, 1000);
                console.log("Created new Game");
            }
            catch (error) {
                console.log(error.message);
                console.error("Could not create a new game because txn failed");
            }
        }
    }
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
}))();
