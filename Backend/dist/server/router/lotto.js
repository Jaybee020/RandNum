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
exports.lottoRouter = void 0;
const express_1 = __importDefault(require("express"));
const lottoCall_1 = require("../../scripts/lottoCall");
const utils_1 = require("../../scripts/utils");
const helpers_1 = require("../helpers");
const lottoHistory_1 = require("../models/lottoHistory");
const config_1 = require("../../scripts/config");
const router = express_1.default.Router();
router.get("/profile/:addr", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const playerAddr = req.params.addr;
    const userLottoInteractions = yield (0, helpers_1.getUserLottoHistory)(playerAddr);
    if (userLottoInteractions) {
        return res.status(200).send({
            status: true,
            data: userLottoInteractions,
        });
    }
    else {
        return res.status(400).send({ status: false, data: null });
    }
}));
router.get("playerCalls/:addr/:lottoId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const playerAddr = req.params.addr;
    const lottoId = Number(req.params.lottoId);
    const userLottoInteractions = yield (0, helpers_1.getUserHistoryByLottoId)(lottoId, playerAddr);
    if (userLottoInteractions) {
        return res.status(200).send({
            status: true,
            data: userLottoInteractions,
        });
    }
    else {
        return res.status(400).send({
            status: false,
            data: null,
        });
    }
}));
router.get("/lottoPayTXnHistory", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lottoPayTxn = yield (0, helpers_1.getLottoPayTxn)();
        return res.status(200).send({
            status: true,
            data: lottoPayTxn,
        });
    }
    catch (error) {
        return res.status(400).send({
            status: false,
            data: null,
        });
    }
}));
router.get("/lottoHistory/:lottoId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lottoId = Number(req.params.lottoId);
        const lottoPayTxn = yield (0, helpers_1.getLottoPayTxnById)(lottoId);
        const lottoCallTxn = yield (0, helpers_1.getLottoCallsById)(lottoId);
        const lottoHistoryDetails = yield (0, helpers_1.getGameParamsById)(lottoId);
        return res.status(200).send({
            status: true,
            data: {
                lottoPayTxn: lottoPayTxn,
                lottoCallTxn: lottoCallTxn,
                lottoHistoryDetails: lottoHistoryDetails,
            },
        });
    }
    catch (error) {
        return res.status(400).send({
            status: false,
            data: null,
        });
    }
}));
router.get("/allLottoIdHistory", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allLottos = yield lottoHistory_1.LottoModel.find({});
        return res.status(200).send({
            status: true,
            data: allLottos,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({
            status: false,
        });
    }
}));
router.get("/currentGameParams", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield (0, config_1.initRedis)();
        const key = "Current Game Parameter";
        const data = yield (0, utils_1.cache)(key, [], 1.5, helpers_1.getCurrentGameParam, client);
        if (!data) {
            return res.status(400).send({
                status: false,
                data: null,
            });
        }
        else {
            return res.status(200).send({
                status: true,
                //@ts-ignore
                data: data,
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({
            status: false,
        });
    }
}));
router.post("/changePlayerGuessNumber", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerAddr, newGuessNumber } = req.body;
        if (!playerAddr || !newGuessNumber) {
            return res.status(400).send({
                status: false,
                message: "Please provide the required fields",
            });
        }
        const data = yield (0, lottoCall_1.changeCurrentGameNumber)(playerAddr, Number(newGuessNumber));
        return res.status(200).send({
            status: true,
            data: data.map(utils_1.encodeTxn),
        });
    }
    catch (error) {
        return res.status(200).send({
            status: false,
        });
    }
}));
router.post("/endCurrentAndCreateNewGame", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ticketingStart, ticketingDuration, withdrawalStart, ticketFee, winMultiplier, maxPlayersAllowed, maxGuessNumber, gameMasterAddr, } = req.body;
        const data = yield (0, helpers_1.endCurrentAndCreateNewGame)(ticketingStart, ticketingDuration, withdrawalStart, ticketFee, winMultiplier, maxPlayersAllowed, maxGuessNumber, gameMasterAddr);
        return res.status(200).send({
            status: true,
            data,
        });
    }
    catch (error) {
        return res.status(400).send({
            status: false,
            data: "An error occured,check your parameters and retry",
        });
    }
}));
router.post("/enterCurrentGame", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerAddr, guessNumber } = req.body;
        if (!playerAddr || !guessNumber) {
            return res.status(400).send({
                status: false,
                message: "Please provide the required fields",
            });
        }
        const ticketFee = (yield (0, helpers_1.getCurrentGameParam)()).ticketFee;
        const data = yield (0, lottoCall_1.enterCurrentGame)(playerAddr, Number(guessNumber), ticketFee);
        return res.status(200).send({
            status: true,
            data: data.map(utils_1.encodeTxn),
        });
    }
    catch (error) {
        return res.status(200).send({
            status: false,
        });
    }
}));
router.get("/getPlayerGuessNumber/:addr", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const playerAddr = req.params.addr;
    const data = yield (0, helpers_1.getPlayerCurrentGuessNumber)(playerAddr);
    if (data === null || data === void 0 ? void 0 : data.data) {
        return res.status(200).send({
            status: true,
            data: data,
        });
    }
    else {
        return res.status(200).send({
            status: false,
        });
    }
}));
router.get("/getGeneratedRandomNumber", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, helpers_1.getCurrentGeneratedNumber)();
    if (data === null || data === void 0 ? void 0 : data.data) {
        return res.status(200).send({
            status: true,
            data: data,
        });
    }
    else {
        return res.status(400).send({
            status: false,
        });
    }
}));
router.post("/generateLuckyNumber", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, helpers_1.generateLuckyNumber)();
    if (data === null || data === void 0 ? void 0 : data.status) {
        return res.status(200).send({
            status: true,
        });
    }
    else {
        return res.status(400).send({
            status: false,
        });
    }
}));
router.post("/checkUserWin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { playerAddr } = req.body;
    if (!playerAddr) {
        return res.status(400).send({
            status: false,
            message: "Please provide the required fields",
        });
    }
    const data = yield (0, helpers_1.checkPlayerWinStatus)(playerAddr);
    if (!data) {
        return res.status(400).send({
            status: false,
            data: null,
        });
    }
    return res.status(200).send({
        status: data.status,
        data: data.data,
    });
}));
exports.lottoRouter = router;
