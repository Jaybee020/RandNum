import Queue from "bull";
import { CronJob } from "cron";
import {
  endCurrentAndCreateNewGame,
  getCurrentGameParam,
} from "../server/helpers";
import { initRedis, user } from "../scripts/config";
import { algodClient, cache } from "../scripts/utils";
import { waitForConfirmation } from "algosdk";
import { GameParams } from "../server/models/lottoHistory";

//The least time a game lasts for is 30 mins
const newGameQueue = new Queue("newGame", "redis://127.0.0.1:6379");

newGameQueue.process(async function (job, done) {
  try {
    const data = await endCurrentAndCreateNewGame();
    console.log(data);
    if (data.newGame.status) {
      const initGameTxns = data.newGame.txns;
      if (initGameTxns && initGameTxns.length > 0) {
        try {
          const signed = initGameTxns.map((txn) => txn.signTxn(user.sk));
          const { txId } = await algodClient.sendRawTransaction(signed).do();
          await waitForConfirmation(algodClient, txId, 1000);
          return txId;
        } catch (error) {
          console.error("Could not create a new game because txn failed");
        }
      }
      const client = await initRedis();
      const key = "Current Game Parameter";
      await cache<GameParams>(key, [], 2, getCurrentGameParam, client);
    }
  } catch (error) {
    console.error(
      "Resetting game failed.Check if current game is still running"
    );
  }
});

export var restartGame = new CronJob(
  "*/8 * * * *",
  function () {
    console.log("Starting to restart game");
    newGameQueue.add(
      {},
      {
        attempts: 3,
        backoff: 3000,
      }
    );
  },
  null,
  true
);
