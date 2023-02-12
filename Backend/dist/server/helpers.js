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
exports.checkAllPlayersWin = exports.endCurrentAndCreateNewGame = exports.checkPlayerWinStatus = exports.decodeTxReference = exports.getGameParamsById = exports.getCurrentGameParam = exports.generateLuckyNumber = exports.getCurrentGeneratedNumber = exports.getPlayerChangeGuessNumber = exports.getPlayerCurrentGuessNumber = exports.getLottoPayTxn = exports.getLottoPayTxnById = exports.getLottoCallsById = exports.getUserHistoryByLottoId = exports.getUserLottoHistory = void 0;
const algosdk_1 = require("algosdk");
const config_1 = require("../scripts/config");
const decode_1 = require("../scripts/decode");
const lottoCall_1 = require("../scripts/lottoCall");
const utils_1 = require("../scripts/utils");
const lottoHistory_1 = require("./models/lottoHistory");
function parseLottoTxn(userTxns) {
    const decoder = new decode_1.LottoGameArgsDecoder();
    const filteredAndParsed = userTxns
        .filter((userTxn) => decoder.encodedMethods.includes(userTxn["application-transaction"]["application-args"][0]))
        .map((userTxn) => {
        const action = decoder.decodeMethod(userTxn["application-transaction"]["application-args"][0]);
        var value;
        if (action == "check_user_win_lottery") {
            value =
                userTxn["application-transaction"]["accounts"][1] ||
                    userTxn["sender"];
        }
        else {
            value = (0, algosdk_1.decodeUint64)(Buffer.from(userTxn["application-transaction"]["application-args"][1], "base64"), "mixed");
        }
        return {
            userAddr: userTxn["sender"],
            action: action,
            value: value,
            txId: userTxn["id"],
            round: userTxn["confirmed-round"],
        };
    });
    return filteredAndParsed;
}
function getUserLottoHistory(userAddr) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userTxns = yield (0, utils_1.getUserTransactionstoApp)(userAddr, config_1.appId);
            const userInteractions = parseLottoTxn(userTxns);
            const filtered = Promise.all(userInteractions.map((userInteraction) => __awaiter(this, void 0, void 0, function* () {
                const lottoDetails = yield lottoHistory_1.LottoModel.findOne({
                    roundEnd: { $gte: userInteraction.round },
                    roundStart: { $lte: userInteraction.round },
                });
                const lottoId = lottoDetails === null || lottoDetails === void 0 ? void 0 : lottoDetails.lottoId;
                const lottoParams = lottoDetails === null || lottoDetails === void 0 ? void 0 : lottoDetails.gameParams;
                return Object.assign({ lottoId: lottoId ? lottoId : -1, lottoParams: lottoParams }, userInteraction);
            })));
            return filtered;
        }
        catch (error) {
            console.log(error);
            return [];
        }
    });
}
exports.getUserLottoHistory = getUserLottoHistory;
function getUserHistoryByLottoId(lottoId, userAddr) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const betHistoryDetails = yield lottoHistory_1.LottoModel.findOne({ lottoId: lottoId });
            var lottoMinRound;
            var lottoMaxRound;
            var userTxns;
            if (betHistoryDetails) {
                lottoMinRound = betHistoryDetails.roundStart;
                lottoMaxRound = betHistoryDetails.roundEnd;
                userTxns = yield (0, utils_1.getUserTransactionstoAppBetweenRounds)(userAddr, config_1.appId, lottoMinRound, lottoMaxRound);
            }
            else {
                return [];
            }
            const userInteractions = parseLottoTxn(userTxns);
            return userInteractions.map((userInteraction) => {
                return Object.assign(Object.assign({}, userInteraction), { lottoId: lottoId, lottoParams: betHistoryDetails === null || betHistoryDetails === void 0 ? void 0 : betHistoryDetails.gameParams });
            });
        }
        catch (error) {
            console.log(error);
            return [];
        }
    });
}
exports.getUserHistoryByLottoId = getUserHistoryByLottoId;
function getLottoCallsById(lottoId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const betHistoryDetails = yield lottoHistory_1.LottoModel.findOne({ lottoId: lottoId });
            if (betHistoryDetails) {
                const lottoMinRound = betHistoryDetails.roundStart;
                const lottoMaxRound = betHistoryDetails.roundEnd;
                const lottoTxns = yield (0, utils_1.getAppCallTransactionsBetweenRounds)(config_1.appId, lottoMinRound, lottoMaxRound);
                const lottoInteractions = parseLottoTxn(lottoTxns);
                return lottoInteractions.map((lottoInteraction) => {
                    return Object.assign(Object.assign({}, lottoInteraction), { lottoId: lottoId });
                });
            }
            else {
                return [];
            }
        }
        catch (error) {
            return [];
        }
    });
}
exports.getLottoCallsById = getLottoCallsById;
function getLottoPayTxnById(lottoId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const betHistoryDetails = yield lottoHistory_1.LottoModel.findOne({ lottoId: lottoId });
            if (betHistoryDetails) {
                const lottoMinRound = betHistoryDetails.roundStart;
                const lottoMaxRound = betHistoryDetails.roundEnd;
                const lottoTxns = yield (0, utils_1.getAppPayTransactionsBetweenRounds)(config_1.appAddr, lottoMinRound, lottoMaxRound);
                const receivedTxns = lottoTxns.filter((lottoTxn) => lottoTxn.sender != config_1.appAddr);
                const sentTxns = lottoTxns.filter((lottoTxn) => lottoTxn.sender == config_1.appAddr);
                return { receivedTxns: receivedTxns, sentTxns: sentTxns };
            }
            else {
                return { receivedTxns: [], sentTxns: [] };
            }
        }
        catch (error) {
            console.log(error);
            return { receivedTxns: [], sentTxns: [] };
        }
    });
}
exports.getLottoPayTxnById = getLottoPayTxnById;
function getLottoPayTxn() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const lottoTxns = yield (0, utils_1.getAppPayTransactions)(config_1.appAddr);
            const receivedTxns = lottoTxns.filter((lottoTxn) => lottoTxn.sender != config_1.appAddr);
            const sentTxns = lottoTxns
                .filter((lottoTxn) => lottoTxn.sender == config_1.appAddr)
                .map((lottoTxn) => {
                return Object.assign(Object.assign({}, lottoTxn), { receiver: lottoTxn["payment-transaction"]["receiver"] });
            });
            return { receivedTxns: receivedTxns, sentTxns: sentTxns };
        }
        catch (error) {
            console.log(error);
            return { receivedTxns: [], sentTxns: [] };
        }
    });
}
exports.getLottoPayTxn = getLottoPayTxn;
function getPlayerCurrentGuessNumber(userAddr) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, lottoCall_1.getUserGuessNumber)(userAddr);
        return result;
    });
}
exports.getPlayerCurrentGuessNumber = getPlayerCurrentGuessNumber;
function getPlayerChangeGuessNumber(userAddr, newGuessNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, lottoCall_1.changeCurrentGameNumber)(userAddr, newGuessNumber);
        return result;
    });
}
exports.getPlayerChangeGuessNumber = getPlayerChangeGuessNumber;
function getCurrentGeneratedNumber() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, lottoCall_1.getGeneratedLuckyNumber)();
        return result;
    });
}
exports.getCurrentGeneratedNumber = getCurrentGeneratedNumber;
function generateLuckyNumber() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, lottoCall_1.generateRandomNumber)();
        return result;
    });
}
exports.generateLuckyNumber = generateLuckyNumber;
function getCurrentGameParam() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield (0, lottoCall_1.getGameParams)();
        const gameParams = {
            ticketingStart: 0,
            ticketingDuration: 0,
            withdrawalStart: 0,
            ticketFee: 0,
            luckyNumber: 0,
            playersTicketBought: 0,
            winMultiplier: 0,
            maxGuessNumber: 0,
            maxPlayersAllowed: 0,
            gameMaster: "",
            playersTicketChecked: 0,
            totalGamePlayed: 0,
        };
        const gameParamsKey = [
            "ticketingStart",
            "ticketingDuration",
            "withdrawalStart",
            "ticketFee",
            "luckyNumber",
            "playersTicketBought",
            "winMultiplier",
            "maxGuessNumber",
            "maxPlayersAllowed",
            "gameMaster",
            "playersTicketChecked",
            "totalGamePlayed",
        ];
        gameParamsKey.forEach(
        //@ts-ignore
        (gameParamKey, i) => (gameParams[gameParamKey] = data.data[i]));
        return gameParams;
    });
}
exports.getCurrentGameParam = getCurrentGameParam;
function getGameParamsById(lottoId) {
    return __awaiter(this, void 0, void 0, function* () {
        const betHistoryDetails = yield lottoHistory_1.LottoModel.findOne({ lottoId: lottoId });
        return betHistoryDetails;
    });
}
exports.getGameParamsById = getGameParamsById;
function decodeTxReference(txId) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield (0, utils_1.getTransactionReference)(txId);
        return data;
    });
}
exports.decodeTxReference = decodeTxReference;
function checkPlayerWinStatus(playerAddr) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield (0, lottoCall_1.checkUserWinLottery)(playerAddr);
        return data;
    });
}
exports.checkPlayerWinStatus = checkPlayerWinStatus;
function endCurrentAndCreateNewGame(ticketingStart = Math.round(Date.now() / 1000 + 200), ticketingDuration = 960, withdrawalStart = ticketingStart + 2000, ticketFee = 2e6, winMultiplier = 10, maxPlayersAllowed = 1000, maxGuessNumber = 100000, gameMasterAddr = config_1.user.addr) {
    return __awaiter(this, void 0, void 0, function* () {
        const resetStatus = yield (0, lottoCall_1.resetGameParams)();
        if (!resetStatus.status || !resetStatus.confirmedRound) {
            return { newLottoDetails: {}, newGame: { status: false, txns: [] } };
        }
        const data = yield (0, lottoCall_1.getGameParams)();
        if (!(data === null || data === void 0 ? void 0 : data.status) || !data.data) {
            return { newLottoDetails: {}, newGame: { status: false, txns: [] } };
        }
        //@ts-ignore
        const lottoId = Number(data.data[10]);
        const gameParams = {};
        const gameParamsKey = [
            "ticketingStart",
            "ticketingDuration",
            "withdrawalStart",
            "ticketFee",
            "luckyNumber",
            "playersTicketBought",
            "winMultiplier",
            "maxGuessNumber",
            "maxPlayersAllowed",
            "gameMaster",
            "playersTicketChecked",
            "totalGamePlayed",
        ];
        gameParamsKey.forEach(
        //@ts-ignore
        (gameParamKey, i) => (gameParams[gameParamKey] = Number(data.data[i])));
        const betHistoryDetails = yield lottoHistory_1.LottoModel.findOne({ lottoId: lottoId });
        if (!betHistoryDetails) {
            const createdLotto = yield lottoHistory_1.LottoModel.create({
                lottoId: lottoId,
                roundStart: 0,
                roundEnd: resetStatus.confirmedRound,
                gameParams: gameParams,
                txReference: data.txId,
            });
        }
        else {
            betHistoryDetails.gameParams = gameParams;
            betHistoryDetails.roundEnd = resetStatus.confirmedRound;
            betHistoryDetails.txReference = data.txId;
            yield betHistoryDetails.save();
        }
        const success = yield (0, lottoCall_1.initializeGameParams)(gameMasterAddr, BigInt(ticketingStart), ticketingDuration, ticketFee, winMultiplier, maxGuessNumber, maxPlayersAllowed, config_1.appAddr, BigInt(withdrawalStart));
        const newLotto = yield lottoHistory_1.LottoModel.create({
            lottoId: lottoId + 1,
            roundStart: resetStatus.confirmedRound,
        });
        return { newLottoDetails: newLotto, newGame: success };
    });
}
exports.endCurrentAndCreateNewGame = endCurrentAndCreateNewGame;
function checkAllPlayersWin(lottoId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const lotto = yield lottoHistory_1.LottoModel.findOne({ lottoId: lottoId });
            if (lotto) {
                const minRound = lotto.roundStart;
                const playerPayTxns = yield (0, utils_1.getAppPayTransactionsFromRound)(config_1.appAddr, minRound);
                const potentialPlayers = playerPayTxns
                    .filter((txn) => txn.group && txn.sender !== config_1.appAddr)
                    .map((txn) => txn.sender);
                const playerCallTxns = yield (0, utils_1.getAppCallTransactionsFromRound)(config_1.appId, minRound);
                const checkedAddresses = parseLottoTxn(playerCallTxns)
                    .filter((parsedTxns) => parsedTxns.action == "check_user_win_lottery")
                    .map((parsedTxn) => parsedTxn.value);
                const uncheckedAddresses = potentialPlayers.filter((player) => !checkedAddresses.includes(player));
                const chunkSize = 5;
                for (let i = 0; i < uncheckedAddresses.length; i += chunkSize) {
                    const chunk = uncheckedAddresses.slice(i, i + chunkSize);
                    // do whatever
                    yield Promise.all(chunk.map((player) => (0, lottoCall_1.checkUserWinLottery)(player)));
                    yield (0, utils_1.sleep)(1);
                }
                return { status: true };
            }
        }
        catch (error) {
            return { status: false };
        }
    });
}
exports.checkAllPlayersWin = checkAllPlayersWin;
