import express, { Router, Request, Response } from "express";
import {
  changeCurrentGameNumber,
  enterCurrentGame,
  getGameParams,
} from "../../scripts/lottoCall";
import {
  checkPlayerWinStatus,
  generateLuckyNumber,
  getCurrentGameParam,
  getCurrentGeneratedNumber,
  getGameParamsById,
  getLottoCallsById,
  getLottoPayTxn,
  getLottoPayTxnById,
  getPlayerCurrentGuessNumber,
  getUserHistoryByLottoId,
  getUserLottoHistory,
} from "../helpers";
import { LottoModel } from "../models/lottoHistory";
const router = express.Router();

router.get("/profile/:addr", async (req: Request, res: Response) => {
  const playerAddr = req.params.addr;
  const userLottoInteractions = await getUserLottoHistory(playerAddr);
  if (userLottoInteractions) {
    return res.status(200).send({
      status: true,
      data: userLottoInteractions,
    });
  } else {
    return res.status(400).send({ status: false, data: null });
  }
});

router.get(
  "playerCalls/:addr/:lottoId",
  async (req: Request, res: Response) => {
    const playerAddr = req.params.addr;
    const lottoId = Number(req.params.lottoId);
    const userLottoInteractions = await getUserHistoryByLottoId(
      lottoId,
      playerAddr
    );
    if (userLottoInteractions) {
      return res.status(200).send({
        status: true,
        data: userLottoInteractions,
      });
    } else {
      return res.status(400).send({
        status: false,
        data: null,
      });
    }
  }
);

router.get("/lottoPayTXnHistory", async (req: Request, res: Response) => {
  try {
    const lottoPayTxn = await getLottoPayTxn();
    return res.status(200).send({
      status: true,
      data: lottoPayTxn,
    });
  } catch (error) {
    return res.status(400).send({
      status: false,
      data: null,
    });
  }
});

router.get("/lottoHistory/:lottoId", async (req: Request, res: Response) => {
  try {
    const lottoId = Number(req.params.lottoId);
    const lottoPayTxn = await getLottoPayTxnById(lottoId);
    const lottoCallTxn = await getLottoCallsById(lottoId);
    const lottoHistoryDetails = await getGameParamsById(lottoId);
    return res.status(200).send({
      status: true,
      data: {
        lottoPayTxn: lottoPayTxn,
        lottoCallTxn: lottoCallTxn,
        lottoHistoryDetails: lottoHistoryDetails,
      },
    });
  } catch (error) {
    return res.status(400).send({
      status: false,
      data: null,
    });
  }
});

router.get("/allLottoIdHistory", async (req: Request, res: Response) => {
  try {
    const allLottos = await LottoModel.find({});
    return res.status(200).send({
      status: true,
      data: allLottos,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      status: false,
    });
  }
});

router.get("/currentGameParams", async (req: Request, res: Response) => {
  const data = await getCurrentGameParam();
  if (!data?.status) {
    return res.status(400).send({
      status: false,
      data: null,
    });
  } else {
    return res.status(200).send({
      status: true,
      data: data.data,
    });
  }
});

router.post("/changePlayerGuessNumber", async (req: Request, res: Response) => {
  const { playerAddr, newGuessNumber } = req.body;
  if (!playerAddr || !newGuessNumber) {
    return res.status(400).send({
      status: false,
      message: "Please provide the required fields",
    });
  }
  const data = await changeCurrentGameNumber(
    playerAddr,
    Number(newGuessNumber)
  );
  return res.status(200).send({
    status: true,
    data: data,
  });
});

router.post("/enterCurrentGame", async (req: Request, res: Response) => {
  const { playerAddr, guessNumber } = req.body;
  if (!playerAddr || !guessNumber) {
    return res.status(400).send({
      status: false,
      message: "Please provide the required fields",
    });
  }
  const data = await enterCurrentGame(playerAddr, Number(guessNumber));
  return res.status(200).send({
    status: true,
    data: data,
  });
});

router.get(
  "/getPlayerGuessNumber/:addr",
  async (req: Request, res: Response) => {
    const playerAddr = req.params.addr;
    const data = await getPlayerCurrentGuessNumber(playerAddr);
    if (data?.data) {
      return res.status(200).send({
        status: true,
        data: data,
      });
    } else {
      return res.status(400).send({
        status: false,
      });
    }
  }
);

router.get("/getGeneratedRandomNumber", async (req: Request, res: Response) => {
  const data = await getCurrentGeneratedNumber();
  if (data?.data) {
    return res.status(200).send({
      status: true,
      data: data,
    });
  } else {
    return res.status(400).send({
      status: false,
    });
  }
});

router.post("/generateLuckyNumber", async (req: Request, res: Response) => {
  const data = await generateLuckyNumber();
  if (data?.status) {
    return res.status(200).send({
      status: true,
    });
  } else {
    return res.status(400).send({
      status: false,
    });
  }
});

router.post("/checkUserWin", async (req: Request, res: Response) => {
  const { playerAddr } = req.body;
  if (!playerAddr) {
    return res.status(400).send({
      status: false,
      message: "Please provide the required fields",
    });
  }
  const data = await checkPlayerWinStatus(playerAddr);
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
});

export const lottoRouter = router;
