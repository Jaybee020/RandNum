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
exports.restartGame = void 0;
const bull_1 = __importDefault(require("bull"));
const cron_1 = require("cron");
const helpers_1 = require("../server/helpers");
const config_1 = require("../scripts/config");
const utils_1 = require("../scripts/utils");
const algosdk_1 = require("algosdk");
//The least time a game lasts for is 30 mins
const newGameQueue = new bull_1.default("newGame", "redis://127.0.0.1:6379");
newGameQueue.process(function (job, done) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, helpers_1.endCurrentAndCreateNewGame)();
            console.log(data);
            if (data.newGame.status) {
                const initGameTxns = data.newGame.txns;
                if (initGameTxns && initGameTxns.length > 0) {
                    try {
                        const signed = initGameTxns.map((txn) => txn.signTxn(config_1.user.sk));
                        const { txId } = yield utils_1.algodClient.sendRawTransaction(signed).do();
                        yield (0, algosdk_1.waitForConfirmation)(utils_1.algodClient, txId, 1000);
                        return txId;
                    }
                    catch (error) {
                        console.error("Could not create a new game because txn failed");
                    }
                }
                const client = yield (0, config_1.initRedis)();
                const key = "Current Game Parameter";
                yield (0, utils_1.cache)(key, [], 2, helpers_1.getCurrentGameParam, client);
            }
        }
        catch (error) {
            console.error("Resetting game failed.Check if current game is still running");
        }
    });
});
exports.restartGame = new cron_1.CronJob("*/8 * * * *", function () {
    console.log("Starting to restart game");
    newGameQueue.add({}, {
        attempts: 3,
        backoff: 3000,
    });
}, null, true);
