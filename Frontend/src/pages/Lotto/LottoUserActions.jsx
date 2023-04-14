import axios from "axios";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";
import { MultiSigner } from "../../utils";
import Icon from "../../components/common/Icon";
import useAppModal from "../../hooks/useAppModal";
import NewGameModal from "../../components/modals/NewGameModal";
import { addressAtom, providerAtom } from "../../atoms/appState";
import { SpinnerCircular } from "spinners-react";
import dayjs from "dayjs";
import WalletConnectModal from "../../components/modals/WalletConnectModal";

const LottoUserActions = ({
  lottoError,
  lottoDetails,
  fetchingLotto,
  refetchCurrentGame,
}) => {
  const [error, setError] = useState("");
  const [randNum, setRandNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const provider = useRecoilValue(providerAtom);
  const walletAddr = useRecoilValue(addressAtom);
  const [phase, setPhase] = useState("ticketing");
  const [winStatus, setWinStatus] = useState(null);
  const [loadingState, setLoadingState] = useState("");
  const [StartGameModal, closeNewGameModal, openNewGameModal] = useAppModal(
    !true
  );

  const { data, isLoading, refetch } = useQuery(
    "getPlayerGuessNumber",
    () =>
      axios
        .get(`/getPlayerGuessNumber/${walletAddr}`)
        .then(response => response?.data?.data?.data),
    { refetchOnWindowFocus: false, enabled: !!walletAddr }
  );

  useEffect(() => {
    if (data && !isNaN(data)) {
      setRandNum(data);
    }
  }, [data]);
  useEffect(() => {
    if (!data || isNaN(data)) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddr]);

  const setNumber = async () => {
    if (loading) return;
    if (Number(data) === Number(randNum)) {
      setError("This is your current guess number");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const txnsArr = await axios
        .post(`/enterCurrentGame`, {
          playerAddr: walletAddr,
          guessNumber: isNaN(randNum) ? 1 : Number(randNum),
        })
        .then(response => response?.data?.data);

      await MultiSigner(txnsArr, provider);
      refetch();
    } catch (error) {
      console.log(error);
      setError(
        error?.message || "An error occurred while setting your guess number"
      );
    } finally {
      setLoading(false);
    }
  };

  const generateLuckyNum = async () => {
    if (loadingState) return;

    setError("");
    setLoadingState("generate-lucky-num");
    try {
      await axios
        .post(`/generateLuckyNumber`, null)
        .then(response => console.log(response));
    } catch (error) {
      setError(
        error?.message || "An error occurred while generating lucky number"
      );
    } finally {
      setLoadingState("");
    }
  };

  const checkWinStatus = async () => {
    if (loadingState) return;

    setError("");
    setLoadingState("check-win-status");
    try {
      await axios
        .post(`/checkUserWin`, {
          playerAddr: walletAddr,
        })
        .then(response => setWinStatus(!!response.data.status));
    } catch (error) {
      setError(error?.message || "An error occurred while checking win status");
    } finally {
      setLoadingState("");
    }
  };

  const changeNumber = async () => {
    if (loadingState) return;
    if (Number(data) === Number(randNum)) {
      setError("This is your current guess number");
      return;
    }

    setError("");
    setLoadingState("change-number");
    try {
      await axios
        .post(`/changePlayerGuessNumber`, {
          playerAddr: walletAddr,
          newGuessNumber: isNaN(randNum) ? 1 : Number(randNum),
        })
        .then(response => response?.data?.data);
    } catch (error) {
      setError(
        error?.message || "An error occurred while changing your guess number"
      );
    } finally {
      setLoadingState("");
    }
  };

  useEffect(() => {
    const isTicketing = dayjs(Date.now()).isBetween(
      lottoDetails?.ticketingStart * 1000,
      (lottoDetails?.ticketingStart + lottoDetails?.ticketingDuration) * 1000,
      "milliseconds",
      "[)"
    );

    const isLive = dayjs(Date.now()).isBetween(
      (lottoDetails?.ticketingStart + lottoDetails?.ticketingDuration) * 1000,
      lottoDetails?.withdrawalStart * 1000,
      "milliseconds",
      "[)"
    );

    if (isTicketing) {
      setPhase("ticketing");
    } else if (isLive) {
      setPhase("live");
    } else {
      setPhase("withdrawal");
    }
  }, [lottoDetails]);

  return (
    !fetchingLotto &&
    !lottoError && (
      <>
        {walletAddr ? (
          <>
            {phase === "ticketing" && (
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
                  </div>

                  <button
                    className="place-bet"
                    onClick={() => {
                      if (isLoading) return;
                      if (data) {
                        changeNumber();
                      } else {
                        setNumber();
                      }
                    }}
                  >
                    {!isLoading && (
                      <p
                        style={{
                          marginRight:
                            loading || loadingState === "change-number"
                              ? "7px"
                              : "0px",
                        }}
                      >
                        {data ? "Change guess" : "Place bet"}
                      </p>
                    )}

                    {(loading ||
                      loadingState === "change-number" ||
                      isLoading) && (
                      <SpinnerCircular
                        size={14}
                        color="#444"
                        secondaryColor="#aaa"
                      />
                    )}
                  </button>
                </div>
              </div>
            )}

            {(phase === "live" || phase === "withdrawal") && (
              <div className="lotto-page__actions guessNum">
                <div className="lotto-place-bet">
                  {lottoDetails?.luckyNumber && lottoDetails?.luckyNumber !== 0
                    ? phase === "withdrawal" &&
                      data && (
                        <button className="place-bet" onClick={checkWinStatus}>
                          <p
                            style={{
                              marginRight:
                                loadingState === "check-win-status"
                                  ? "7px"
                                  : "0px",
                            }}
                          >
                            Check win status{" "}
                            {winStatus !== null
                              ? winStatus
                                ? ": Won"
                                : ": Lost"
                              : null}
                          </p>
                          {loadingState === "check-win-status" && (
                            <SpinnerCircular
                              size={14}
                              color="#444"
                              secondaryColor="#aaa"
                            />
                          )}
                        </button>
                      )
                    : phase === "live" &&
                      !lottoDetails?.luckyNumber && (
                        <button
                          className="place-bet"
                          onClick={generateLuckyNum}
                        >
                          <p
                            style={{
                              marginRight:
                                loadingState === "generate-lucky-num"
                                  ? "7px"
                                  : "0px",
                            }}
                          >
                            Generate Lucky Number
                          </p>
                          {loadingState === "generate-lucky-num" && (
                            <SpinnerCircular
                              size={14}
                              color="#444"
                              secondaryColor="#aaa"
                            />
                          )}
                        </button>
                      )}

                  {data && (
                    <button
                      className="place-bet"
                      style={{
                        cursor: "default",
                      }}
                    >
                      Current guess: {data}
                    </button>
                  )}

                  {phase === "withdrawal" &&
                    lottoDetails?.playersTicketBought ===
                      lottoDetails?.playersTicketChecked && (
                      <button className="place-bet" onClick={openNewGameModal}>
                        Start new game
                      </button>
                    )}
                </div>
              </div>
            )}

            {!!error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
          </>
        ) : (
          <div className="connect-wallet-message">
            Connect wallet to create a new game or join the current one
          </div>
        )}

        <StartGameModal isCentered={true} newGame={true && !!walletAddr}>
          {!!walletAddr ? (
            <NewGameModal
              closeNewGameModal={closeNewGameModal}
              refetchCurrentGame={refetchCurrentGame}
            />
          ) : (
            <WalletConnectModal closeConnectModal={closeNewGameModal} />
          )}
        </StartGameModal>
      </>
    )
  );
};

export default LottoUserActions;
