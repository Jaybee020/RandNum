import algosdk from "algosdk";
import axios from "axios";
import { useState } from "react";
import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";
import Icon from "../../components/common/Icon";
import { MyAlgoInst, PeraInst } from "../../utils";
import { addressAtom, providerAtom } from "../../atoms/appState";
import { ALGOD_CLIENT } from "../../utils/constants";

const LottoUserActions = ({ lottoDetails }) => {
  const [randNum, setRandNum] = useState(1);
  const provider = useRecoilValue(providerAtom);
  const walletAddr = useRecoilValue(addressAtom);

  const { data } = useQuery(
    "getPlayerGuessNumber",
    () =>
      axios
        .get(`/getPlayerGuessNumber/${walletAddr}`)
        .then(response => response?.data?.data?.data),
    { refetchOnWindowFocus: false, retry: false, enabled: !!walletAddr }
  );

  const MultiSigner = async txns => {
    try {
      if (provider === "myAlgo") {
        const decodedTxns = txns.map(txn =>
          algosdk.decodeUnsignedTransaction(new Uint8Array(txn)).toByte()
        );

        MyAlgoInst.wallet
          .signTransaction(decodedTxns)
          .then(async signedTxns => {
            const blobArray = signedTxns.map(item => item.blob);

            ALGOD_CLIENT["testnet"]
              .sendRawTransaction(blobArray)
              .do()
              .then(submittedTxn => {
                console.log("done");
              })
              .catch(error => {
                console.log(error);
              });
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        console.log("//");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const generateLuckyNum = async () => {
    await axios
      .post(`/generateLuckyNumber`, null)
      .then(response => console.log(response));
  };

  const [winStatus, setWinStatus] = useState(null);
  const checkWinStatus = async () => {
    await axios
      .post(`/checkUserWin`, {
        playerAddr: walletAddr,
      })
      .then(response => setWinStatus(!!response.data.status));
  };

  const setNumber = async () => {
    const txnsArr = await axios
      .post(`/enterCurrentGame`, {
        playerAddr: walletAddr,
        guessNumber: isNaN(randNum) ? 1 : Number(randNum),
      })
      .then(response => response?.data?.data);

    MultiSigner(txnsArr);
  };

  const changeNumber = async () => {
    const txnsArr = await axios
      .post(`/changePlayerGuessNumber`, {
        playerAddr: walletAddr,
        newGuessNumber: isNaN(randNum) ? 1 : Number(randNum),
      })
      .then(response => response?.data?.data);

    console.log(txnsArr);
  };

  return (
    <>
      {walletAddr && (
        <>
          <div className="lotto-page__actions">
            <div className="lotto-place-bet">
              <div className="lotto-input">
                <div className="lotto-input__icon">
                  <i className="ph-magnifying-glass" />
                  <Icon.Dawn />
                </div>

                <input
                  min={1}
                  max={10000}
                  type="number"
                  value={randNum}
                  placeholder="Input Randnum"
                  onChange={e =>
                    setRandNum(
                      e.target.valueAsNumber < 1
                        ? 1
                        : e.target.valueAsNumber > 10000
                        ? 10000
                        : e.target.valueAsNumber
                    )
                  }
                />

                <button></button>
              </div>

              <button
                className="place-bet"
                onClick={data ? changeNumber : setNumber}
              >
                {data ? "Change guess" : "Place bet"}
              </button>
            </div>
          </div>

          {data ||
            (Date.now() - lottoDetails?.withdrawalStart * 1000 >= 0 && (
              <div className="lotto-page__actions guessNum">
                <div className="lotto-place-bet">
                  {Date.now() - lottoDetails?.withdrawalStart * 1000 >= 0 && (
                    <button className="place-bet" onClick={checkWinStatus}>
                      Check win status{" "}
                      {winStatus !== null
                        ? winStatus
                          ? ": Won"
                          : ": Lost"
                        : null}
                    </button>
                  )}

                  {Date.now() -
                    Number(
                      lottoDetails?.ticketingStart +
                        lottoDetails?.ticketingDuration
                    ) *
                      1000 >=
                    0 &&
                    lottoDetails?.luckyNumber !== 0 && (
                      <button className="place-bet" onClick={generateLuckyNum}>
                        Generate Lucky Number
                      </button>
                    )}

                  {data && (
                    <button className="place-bet">Current guess: {data}</button>
                  )}
                </div>
              </div>
            ))}
        </>
      )}
    </>
  );
};

export default LottoUserActions;
