import {
  encodeUint64,
  getApplicationAddress,
  makeApplicationNoOpTxn,
  makeBasicAccountTransactionSigner,
  makeApplicationOptInTxn,
  Transaction,
  ABIContract,
  AtomicTransactionComposer,
  ABIMethod,
  Account,
  OnApplicationComplete,
  makePaymentTxnWithSuggestedParamsFromObject,
  assignGroupID,
  ALGORAND_MIN_TX_FEE,
} from "algosdk";
import { appAddr, appId, randomnessBeaconContract, user } from "./config";
import { algoIndexer, checkUserOptedIn, getMethodByName } from "./utils";
// import { appId, user } from "./config";
import { algodClient, submitTransaction } from "./utils";

async function OptIn(user: Account, appId: number) {
  let txId: string;
  let txn;

  // get transaction params
  const params = await algodClient.getTransactionParams().do();

  // deposit
  //@ts-ignore
  const enc = new TextEncoder();
  const depositAmount = 1e6; // 1 ALGO

  // create and send OptIn
  txn = makeApplicationOptInTxn(user.addr, params, appId);
  txId = await submitTransaction(txn, user.sk);

  // display results
  let transactionResponse = await algodClient
    .pendingTransactionInformation(txId)
    .do();
  console.log("Opted-in to app-id:", transactionResponse["txn"]["txn"]["apid"]);
}

export async function enterCurrentGame(
  playerAddr: string,
  guessNumber: number
) {
  // string parameter
  const params = await algodClient.getTransactionParams().do();
  const ticketTXn = makePaymentTxnWithSuggestedParamsFromObject({
    suggestedParams: params,
    from: playerAddr,
    to: appAddr,
    amount: 2e6,
  });
  const abi = new ABIMethod({
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
  const encodedLuckyNumber = encodeUint64(guessNumber);
  var applCallTxn = makeApplicationOptInTxn(playerAddr, params, appId, [
    abi.getSelector(),
    encodedLuckyNumber,
  ]);
  if (await checkUserOptedIn(playerAddr, appId)) {
    applCallTxn = makeApplicationNoOpTxn(playerAddr, params, appId, [
      abi.getSelector(),
      encodedLuckyNumber,
    ]);
  }
  return assignGroupID([ticketTXn, applCallTxn]);
}

export async function changeCurrentGameNumber(
  playerAddr: string,
  newGuessNumber: number
) {
  const params = await algodClient.getTransactionParams().do();

  const abi = new ABIMethod({
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
  const encodedLuckyNumber = encodeUint64(newGuessNumber);
  const applCallTxn = makeApplicationNoOpTxn(playerAddr, params, appId, [
    abi.getSelector(),
    encodedLuckyNumber,
  ]);
  return [applCallTxn];
}

export async function call(
  user: Account,
  appId: number,
  method: string,
  methodArgs: any[],
  OnComplete?: OnApplicationComplete
) {
  const params = await algodClient.getTransactionParams().do();
  params.flatFee = true;
  params.fee = ALGORAND_MIN_TX_FEE;

  const commonParams = {
    appID: appId,
    sender: user.addr,
    suggestedParams: params,
    signer: makeBasicAccountTransactionSigner(user),
  };

  let atc = new AtomicTransactionComposer();
  atc.addMethodCall({
    method: getMethodByName(method),
    methodArgs: methodArgs,
    ...commonParams,
    onComplete: OnComplete,
  });
  const result = await atc.execute(algodClient, 2);
  for (const idx in result.methodResults) {
    // console.log(result.methodResults[idx]);
  }
  return result;
}

// console.log(SHA256("Hello").toString(enc.Base64));
// call(user, appId, "generate_lucky_number", [110096026]).catch(console.error);
// call(user, appId, "get_latest_multiple", []).catch(console.error);

export async function getTotalGamesPlayed() {
  try {
    const data = await call(user, appId, "get_total_game_played ", []);
    if (data && data.methodResults[0].returnValue) {
      return parseInt(data.methodResults[0].returnValue.toString());
    }
  } catch (error) {
    return { staus: false };
  }
}

export async function getGameParams() {
  try {
    const data = await call(user, appId, "get_game_params", []);

    if (data && data.methodResults[0].returnValue) {
      return {
        data: data.methodResults[0].returnValue,
        txId: data.txIDs[0],
        status: true,
      };
    }
  } catch (error) {
    return { status: false };
  }
}

export async function checkUserWinLottery(userAddr: string) {
  try {
    const data = await call(user, appId, "check_user_win_lottery", [userAddr]);

    if (data && data.methodResults[0].returnValue) {
      return {
        status: true,
        data: data.methodResults[0].returnValue,
      };
    }
  } catch (error) {
    console.log(error);
    return { status: false };
  }
}

export async function getUserGuessNumber(userAddr: string) {
  try {
    const data = await call(user, appId, "get_user_guess_number", [userAddr]);
    if (data && data.methodResults[0].returnValue) {
      return {
        data: data.methodResults[0].returnValue.toString(),
      };
    }
  } catch (error) {
    console.log(error);
    return { status: false };
  }
}

export async function putLuckyNumber() {
  try {
    await call(user, appId, "put_lucky_number", []);
    return { status: true };
  } catch (error) {
    console.log(error);
    return { status: false };
  }
}

export async function generateRandomNumber() {
  try {
    await call(user, appId, "generate_lucky_number", [
      randomnessBeaconContract,
    ]);
    return { status: true };
  } catch (error) {
    console.log(error);
    return { status: false };
  }
}

export async function getGeneratedLuckyNumber() {
  try {
    const data = await call(user, appId, "get_lucky_number", []);
    if (data && data.methodResults[0].returnValue) {
      return {
        data: data.methodResults[0].returnValue.toString(),
      };
    }
  } catch (error) {
    return { status: false };
  }
}
export async function initializeGameParams(
  ticketingStart: number | bigint,
  ticketingDuration: number,
  ticketFee: number,
  withdrawalStart: number | bigint
) {
  try {
    await call(user, appId, "initiliaze_game_params", [
      ticketingStart,
      ticketingDuration,
      ticketFee,
      withdrawalStart,
    ]);
    return {
      status: true,
    };
  } catch (error) {
    console.log(error);
    return { status: false };
  }
}

export async function resetGameParams() {
  try {
    const data = await call(user, appId, "get_total_game_played ", ["100"]);
    return {
      status: true,
      confirmedRound: data.confirmedRound,
    };
  } catch (error) {
    return { status: false };
  }
}

export async function getTimeStamp() {
  try {
    const data = await call(user, appId, "get_current_timestamp", []);
    if (data && data.methodResults[0].returnValue) {
      return {
        data: data.methodResults[0].returnValue.toString(),
      };
    }
  } catch (error) {
    console.log(error);
    return { status: false };
  }
}
