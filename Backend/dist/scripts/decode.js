"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LottoGameArgsDecoder = void 0;
const algosdk_1 = require("algosdk");
class LottoGameArgsDecoder {
    constructor() {
        this.encodedMethods = [];
        this.decodedMethods = [];
        const enterGameABI = new algosdk_1.ABIMethod({
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
        this.encodedMethods.push(Buffer.from(enterGameABI.getSelector()).toString("base64"));
        this.decodedMethods.push(enterGameABI.name);
        const changegNumberABI = new algosdk_1.ABIMethod({
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
        this.encodedMethods.push(Buffer.from(changegNumberABI.getSelector()).toString("base64"));
        this.decodedMethods.push(changegNumberABI.name);
        const generateLuckyNumberABI = new algosdk_1.ABIMethod({
            name: "generate_lucky_number",
            args: [
                {
                    type: "application",
                    name: "application_Id",
                },
            ],
            returns: {
                type: "void",
            },
        });
        this.encodedMethods.push(Buffer.from(generateLuckyNumberABI.getSelector()).toString("base64"));
        this.decodedMethods.push(generateLuckyNumberABI.name);
        const checkUserWinLotteryABI = new algosdk_1.ABIMethod({
            name: "check_user_win_lottery",
            args: [
                {
                    type: "account",
                    name: "player",
                },
            ],
            returns: {
                type: "bool",
            },
        });
        this.encodedMethods.push(Buffer.from(checkUserWinLotteryABI.getSelector()).toString("base64"));
        this.decodedMethods.push(checkUserWinLotteryABI.name);
    }
    decodeMethod(encodedMethod) {
        const index = this.encodedMethods.findIndex((method) => method == encodedMethod);
        if (index == -1) {
            return null;
        }
        return this.decodedMethods[index];
    }
}
exports.LottoGameArgsDecoder = LottoGameArgsDecoder;
// const decoder = new LottoGameArgsDecoder();
// console.log(decoder.decodedMethods);
// console.log(decoder.encodedMethods);
// console.log(decoder.decodeMethod("XtYrJg=="));
