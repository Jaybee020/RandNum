import { decodeAddress, decodeUint64, encodeAddress } from "algosdk";
import { appAddr, appId, user } from "../scripts/config";
import { LottoGameArgsDecoder } from "../scripts/decode";
import {
  changeCurrentGameNumber,
  checkUserWinLottery,
  generateRandomNumber,
  getGameParams,
  getGeneratedLuckyNumber,
  getUserGuessNumber,
  resetGameParams,
} from "../scripts/lottoCall";
import {
  getAppCallTransactionsBetweenRounds,
  getAppPayTransactions,
  getAppPayTransactionsBetweenRounds,
  getTransaction,
  getUserTransactionstoApp,
  getUserTransactionstoAppBetweenRounds,
} from "../scripts/utils";
import { GameParams, LottoModel } from "./models/lottoHistory";

interface UserBetDetail {
  userAddr: string;
  lottoId: number;
  action: string | null;
  value: any;
  round: number;
  txId: string;
}

interface Transaction {
  sender: string;
  id: string;
  group?: string;
  "confirmed-round": number;
  "application-transaction": any;
}

function parseLottoTxn(userTxns: Transaction[]) {
  const decoder = new LottoGameArgsDecoder();
  const filteredAndParsed = userTxns
    .filter((userTxn) =>
      decoder.encodedMethods.includes(
        userTxn["application-transaction"]["application-args"][0]
      )
    )
    .map((userTxn) => {
      const action = decoder.decodeMethod(
        userTxn["application-transaction"]["application-args"][0]
      );
      var value;
      if (action == "check_user_win_lottery") {
        value =
          userTxn["application-transaction"]["accounts"][0] ||
          userTxn["sender"];
      } else {
        value = decodeUint64(
          Buffer.from(
            userTxn["application-transaction"]["application-args"][1],
            "base64"
          ),
          "mixed"
        );
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

export async function getUserLottoHistory(
  userAddr: string
): Promise<UserBetDetail[] | undefined> {
  try {
    const userTxns: Transaction[] = await getUserTransactionstoApp(
      userAddr,
      appId
    );
    const userInteractions = parseLottoTxn(userTxns);

    const filtered = Promise.all(
      userInteractions.map(async (userInteraction) => {
        const lottoId = (
          await LottoModel.findOne({
            roundEnd: { $gte: userInteraction.round },
            roundStart: { $lte: userInteraction.round },
          })
        )?.lottoId;
        return {
          lottoId: lottoId ? lottoId : -1,
          ...userInteraction,
        };
      })
    );

    return filtered;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getUserHistoryByLottoId(
  lottoId: number,
  userAddr: string
): Promise<UserBetDetail[]> {
  try {
    const betHistoryDetails = await LottoModel.findOne({ lottoId: lottoId });
    if (betHistoryDetails) {
      const lottoMinRound = betHistoryDetails.roundStart;
      const lottoMaxRound = betHistoryDetails.roundEnd;
      const userTxns: Transaction[] =
        await getUserTransactionstoAppBetweenRounds(
          userAddr,
          appId,
          lottoMinRound,
          lottoMaxRound
        );

      const userInteractions = parseLottoTxn(userTxns);

      return userInteractions.map((userInteraction) => {
        return {
          ...userInteraction,
          lottoId: lottoId,
        };
      });
    } else {
      return [];
    }
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getLottoCallsById(lottoId: number) {
  try {
    const betHistoryDetails = await LottoModel.findOne({ lottoId: lottoId });
    if (betHistoryDetails) {
      const lottoMinRound = betHistoryDetails.roundStart;
      const lottoMaxRound = betHistoryDetails.roundEnd;
      const lottoTxns = await getAppCallTransactionsBetweenRounds(
        appId,
        lottoMinRound,
        lottoMaxRound
      );

      const lottoInteractions = parseLottoTxn(lottoTxns);

      return lottoInteractions.map((lottoInteraction) => {
        return {
          ...lottoInteraction,
          lottoId: lottoId,
        };
      });
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}

export async function getLottoPayTxnById(lottoId: number) {
  try {
    const betHistoryDetails = await LottoModel.findOne({ lottoId: lottoId });
    if (betHistoryDetails) {
      const lottoMinRound = betHistoryDetails.roundStart;
      const lottoMaxRound = betHistoryDetails.roundEnd;
      const lottoTxns: Transaction[] = await getAppPayTransactionsBetweenRounds(
        appAddr,
        lottoMinRound,
        lottoMaxRound
      );

      const receivedTxns = lottoTxns.filter(
        (lottoTxn) => lottoTxn.sender != appAddr
      );
      const sentTxns = lottoTxns.filter(
        (lottoTxn) => lottoTxn.sender == appAddr
      );
      return { receivedTxns: receivedTxns, sentTxns: sentTxns };
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getLottoPayTxn() {
  try {
    const lottoTxns: Transaction[] = await getAppPayTransactions(appAddr);
    const receivedTxns = lottoTxns.filter(
      (lottoTxn) => lottoTxn.sender != appAddr
    );
    const sentTxns = lottoTxns.filter((lottoTxn) => lottoTxn.sender == appAddr);
    return { receivedTxns: receivedTxns, sentTxns: sentTxns };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getPlayerCurrentGuessNumber(userAddr: string) {
  const result = await getUserGuessNumber(userAddr);
  return result;
}

export async function getPlayerChangeGuessNumber(
  userAddr: string,
  newGuessNumber: number
) {
  const result = await changeCurrentGameNumber(userAddr, newGuessNumber);
  return result;
}

export async function getCurrentGeneratedNumber() {
  const result = await getGeneratedLuckyNumber();
  return result;
}

export async function generateLuckyNumber() {
  const result = await generateRandomNumber();
  return result;
}

export async function getCurrentGameParam() {
  const data = await getGameParams();
  return data;
}

export async function getGameParamsById(lottoId: number) {
  const betHistoryDetails = await LottoModel.findOne({ lottoId: lottoId });
  return betHistoryDetails;
}

export async function decodeTxReference(txId: string) {
  const data = await getTransaction(txId);
  return data;
}

export async function checkPlayerWinStatus(playerAddr: string) {
  const data = await checkUserWinLottery(playerAddr);
  return data;
}

export async function endCurrentAndCreateNewGame() {
  const resetStatus = await resetGameParams();
  if (!resetStatus.status || !resetStatus.confirmedRound) {
    return "Could not reset Game";
  }
  const data = await getGameParams();
  if (!data?.status || !data.data) {
    return "Could not fetch game Params to update";
  }
  //@ts-ignore
  const lottoId = Number(data.data[7]);
  const gameParams: any = {};
  const gameParamsKey = [
    "ticketingStart",
    "ticketingDuration",
    "withdrawalStart",
    "ticketFee",
    "luckyNumber",
    "playersTicketBought",
    "playersTicketChecked",
  ];
  gameParamsKey.forEach(
    //@ts-ignore
    (gameParamKey, i) => (gameParams[gameParamKey] = Number(data.data[i]))
  );
  const betHistoryDetails = await LottoModel.findOne({ lottoId: lottoId });
  if (!betHistoryDetails) {
    const createdLotto = await LottoModel.create({
      lottoId: lottoId,
      roundStart: 0,
      roundEnd: resetStatus.confirmedRound,
      gameParams: gameParams,
      txReference: data.txId,
    });
  } else {
    betHistoryDetails.gameParams = gameParams;
    betHistoryDetails.roundEnd = resetStatus.confirmedRound;
    betHistoryDetails.txReference = data.txId;
    await betHistoryDetails.save();
  }
  const newLotto = await LottoModel.create({
    lottoId: lottoId + 1,
    roundStart: resetStatus.confirmedRound,
  });
  return newLotto;
}
