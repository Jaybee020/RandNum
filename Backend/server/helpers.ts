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
  initializeGameParams,
  resetGameParams,
} from "../scripts/lottoCall";
import {
  getAppCallTransactionsBetweenRounds,
  getAppCallTransactionsFromRound,
  getAppPayTransactions,
  getAppPayTransactionsBetweenRounds,
  getAppPayTransactionsFromRound,
  getTransaction,
  getUserTransactionstoApp,
  getUserTransactionstoAppBetweenRounds,
  sleep,
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
  "payment-transaction": {
    receiver: string;
  };
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
        const lottoDetails = await LottoModel.findOne({
          roundEnd: { $gte: userInteraction.round },
          roundStart: { $lte: userInteraction.round },
        });

        const lottoId = lottoDetails?.lottoId;
        const lottoParams = lottoDetails?.gameParams;
        return {
          lottoId: lottoId ? lottoId : -1,
          lottoParams: lottoParams,
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
          lottoParams: betHistoryDetails.gameParams,
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
    const sentTxns = lottoTxns
      .filter((lottoTxn) => lottoTxn.sender == appAddr)
      .map((lottoTxn) => {
        return {
          ...lottoTxn,
          receiver: lottoTxn["payment-transaction"]["receiver"],
        };
      });
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
  return gameParams;
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
  const ticketingStart = Math.round(Date.now() / 1000 + 200);
  const ticketingDuration = 960;
  const withdrawalStart = ticketingStart + 2000;
  const ticketFee = 2e6;
  const success = await initializeGameParams(
    BigInt(ticketingStart),
    ticketingDuration,
    ticketFee,
    BigInt(withdrawalStart)
  );
  const newLotto = await LottoModel.create({
    lottoId: lottoId + 1,
    roundStart: resetStatus.confirmedRound,
  });
  return { newLottoDetails: newLotto, newGame: success };
}

export async function checkAllPlayersWin(lottoId: number) {
  try {
    const lotto = await LottoModel.findOne({ lottoId: lottoId });
    if (lotto) {
      const minRound = lotto.roundStart;
      const playerPayTxns: Transaction[] = await getAppPayTransactionsFromRound(
        appAddr,
        minRound
      );

      const potentialPlayers = playerPayTxns
        .filter((txn) => txn.group && txn.sender !== appAddr)
        .map((txn) => txn.sender);

      const playerCallTxns = await getAppCallTransactionsFromRound(
        appId,
        minRound
      );
      const checkedAddresses = parseLottoTxn(playerCallTxns)
        .filter((parsedTxns) => parsedTxns.action == "check_user_win_lottery")
        .map((parsedTxn) => parsedTxn.value);
      const uncheckedAddresses = potentialPlayers.filter(
        (player) => !checkedAddresses.includes(player)
      );

      const chunkSize = 5;
      for (let i = 0; i < uncheckedAddresses.length; i += chunkSize) {
        const chunk = uncheckedAddresses.slice(i, i + chunkSize);
        // do whatever
        await Promise.all(chunk.map((player) => checkUserWinLottery(player)));

        await sleep(1);
      }
      return { status: true };
    }
  } catch (error) {
    return { status: false };
  }
}
