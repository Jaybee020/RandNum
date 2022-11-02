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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeStamp = exports.resetGameParams = exports.initializeGameParams = exports.getGeneratedLuckyNumber = exports.generateRandomNumber = exports.putLuckyNumber = exports.getUserGuessNumber = exports.checkUserWinLottery = exports.getGameParams = exports.getTotalGamesPlayed = exports.call = exports.changeCurrentGameNumber = exports.enterCurrentGame = void 0;
const algosdk_1 = require("algosdk");
const config_1 = require("./config");
const utils_1 = require("./utils");
// import { appId, user } from "./config";
const utils_2 = require("./utils");
function OptIn(user, appId) {
    return __awaiter(this, void 0, void 0, function* () {
        let txId;
        let txn;
        // get transaction params
        const params = yield utils_2.algodClient.getTransactionParams().do();
        // deposit
        //@ts-ignore
        const enc = new TextEncoder();
        const depositAmount = 1e6; // 1 ALGO
        // create and send OptIn
        txn = (0, algosdk_1.makeApplicationOptInTxn)(user.addr, params, appId);
        txId = yield (0, utils_2.submitTransaction)(txn, user.sk);
        // display results
        let transactionResponse = yield utils_2.algodClient
            .pendingTransactionInformation(txId)
            .do();
        console.log("Opted-in to app-id:", transactionResponse["txn"]["txn"]["apid"]);
    });
}
function enterCurrentGame(playerAddr, guessNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        // string parameter
        const params = yield utils_2.algodClient.getTransactionParams().do();
        const ticketTXn = (0, algosdk_1.makePaymentTxnWithSuggestedParamsFromObject)({
            suggestedParams: params,
            from: playerAddr,
            to: config_1.appAddr,
            amount: 2e6,
        });
        const abi = new algosdk_1.ABIMethod({
            name: "enter_game",
            args: [
                {
                    type: "uint64",
                    name: "guess_number",
                },
                {
                    type: "pay",
                    name: "ticket_txn",
                },
            ],
            returns: {
                type: "void",
            },
        });
        const encodedLuckyNumber = (0, algosdk_1.encodeUint64)(guessNumber);
        var applCallTxn = (0, algosdk_1.makeApplicationOptInTxn)(playerAddr, params, config_1.appId, [
            abi.getSelector(),
            encodedLuckyNumber,
        ]);
        if (yield (0, utils_1.checkUserOptedIn)(playerAddr, config_1.appId)) {
            applCallTxn = (0, algosdk_1.makeApplicationNoOpTxn)(playerAddr, params, config_1.appId, [
                abi.getSelector(),
                encodedLuckyNumber,
            ]);
        }
        return (0, algosdk_1.assignGroupID)([ticketTXn, applCallTxn]);
    });
}
exports.enterCurrentGame = enterCurrentGame;
function changeCurrentGameNumber(playerAddr, newGuessNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = yield utils_2.algodClient.getTransactionParams().do();
        const abi = new algosdk_1.ABIMethod({
            name: "change_guess_number",
            args: [
                {
                    type: "uint64",
                    name: "new_guess_number",
                },
            ],
            returns: {
                type: "void",
            },
        });
        const encodedLuckyNumber = (0, algosdk_1.encodeUint64)(newGuessNumber);
        const applCallTxn = (0, algosdk_1.makeApplicationNoOpTxn)(playerAddr, params, config_1.appId, [
            abi.getSelector(),
            encodedLuckyNumber,
        ]);
        return [applCallTxn];
    });
}
exports.changeCurrentGameNumber = changeCurrentGameNumber;
function call(user, appId, method, methodArgs, OnComplete) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = yield utils_2.algodClient.getTransactionParams().do();
        params.flatFee = true;
        params.fee = algosdk_1.ALGORAND_MIN_TX_FEE;
        const commonParams = {
            appID: appId,
            sender: user.addr,
            suggestedParams: params,
            signer: (0, algosdk_1.makeBasicAccountTransactionSigner)(user),
        };
        let atc = new algosdk_1.AtomicTransactionComposer();
        atc.addMethodCall(Object.assign(Object.assign({ method: (0, utils_1.getMethodByName)(method), methodArgs: methodArgs }, commonParams), { onComplete: OnComplete }));
        const result = yield atc.execute(utils_2.algodClient, 2);
        for (const idx in result.methodResults) {
            // console.log(result.methodResults[idx]);
        }
        return result;
    });
}
exports.call = call;
// console.log(SHA256("Hello").toString(enc.Base64));
// call(user, appId, "generate_lucky_number", [110096026]).catch(console.error);
// call(user, appId, "get_latest_multiple", []).catch(console.error);
function getTotalGamesPlayed() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield call(config_1.user, config_1.appId, "get_total_game_played ", []);
            if (data && data.methodResults[0].returnValue) {
                return parseInt(data.methodResults[0].returnValue.toString());
            }
        }
        catch (error) {
            return { staus: false };
        }
    });
}
exports.getTotalGamesPlayed = getTotalGamesPlayed;
function getGameParams() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield call(config_1.user, config_1.appId, "get_game_params", []);
            if (data && data.methodResults[0].returnValue) {
                return {
                    data: data.methodResults[0].returnValue,
                    txId: data.txIDs[0],
                    status: true,
                };
            }
        }
        catch (error) {
            return { status: false };
        }
    });
}
exports.getGameParams = getGameParams;
function checkUserWinLottery(userAddr) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield call(config_1.user, config_1.appId, "check_user_win_lottery", [userAddr]);
            if (data && data.methodResults[0].returnValue) {
                return {
                    status: true,
                    data: data.methodResults[0].returnValue,
                };
            }
        }
        catch (error) {
            console.log(error);
            return { status: false };
        }
    });
}
exports.checkUserWinLottery = checkUserWinLottery;
function getUserGuessNumber(userAddr) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield call(config_1.user, config_1.appId, "get_user_guess_number", [userAddr]);
            if (data && data.methodResults[0].returnValue) {
                return {
                    data: data.methodResults[0].returnValue.toString(),
                };
            }
        }
        catch (error) {
            console.log(error);
            return { status: false };
        }
    });
}
exports.getUserGuessNumber = getUserGuessNumber;
function putLuckyNumber() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield call(config_1.user, config_1.appId, "put_lucky_number", []);
            return { status: true };
        }
        catch (error) {
            console.log(error);
            return { status: false };
        }
    });
}
exports.putLuckyNumber = putLuckyNumber;
function generateRandomNumber() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield call(config_1.user, config_1.appId, "generate_lucky_number", [
                config_1.randomnessBeaconContract,
            ]);
            return { status: true };
        }
        catch (error) {
            console.log(error);
            return { status: false };
        }
    });
}
exports.generateRandomNumber = generateRandomNumber;
function getGeneratedLuckyNumber() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield call(config_1.user, config_1.appId, "get_lucky_number", []);
            if (data && data.methodResults[0].returnValue) {
                return {
                    data: data.methodResults[0].returnValue.toString(),
                };
            }
        }
        catch (error) {
            return { status: false };
        }
    });
}
exports.getGeneratedLuckyNumber = getGeneratedLuckyNumber;
function initializeGameParams(ticketingStart, ticketingDuration, ticketFee, withdrawalStart) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield call(config_1.user, config_1.appId, "initiliaze_game_params", [
                ticketingStart,
                ticketingDuration,
                ticketFee,
                withdrawalStart,
            ]);
            return {
                status: true,
            };
        }
        catch (error) {
            console.log(error);
            return { status: false };
        }
    });
}
exports.initializeGameParams = initializeGameParams;
function resetGameParams() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield call(config_1.user, config_1.appId, "get_total_game_played ", ["100"]);
            return {
                status: true,
                confirmedRound: data.confirmedRound,
            };
        }
        catch (error) {
            return { status: false };
        }
    });
}
exports.resetGameParams = resetGameParams;
function getTimeStamp() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield call(config_1.user, config_1.appId, "get_current_timestamp", []);
            if (data && data.methodResults[0].returnValue) {
                return {
                    data: data.methodResults[0].returnValue.toString(),
                };
            }
        }
        catch (error) {
            console.log(error);
            return { status: false };
        }
    });
}
exports.getTimeStamp = getTimeStamp;
