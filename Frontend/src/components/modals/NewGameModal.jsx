import axios from "axios";
import Icon from "../common/Icon";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { Menu, MenuItem } from "@szhsin/react-menu";
import { addressAtom, providerAtom } from "../../atoms/appState";
import { SpinnerCircular } from "spinners-react";
import { MultiSigner } from "../../utils";
import algosdk from "algosdk";

const ticketingOptions = [
  "In 10 minutes",
  "In 30 minutes",
  "In 1 hour",
  "In 2 hours",
];
const withdrawalOptions = [
  "1 hour after",
  "2 hours after",
  "3 hours after",
  "4 hours after",
];

const NewGameModal = ({ closeNewGameModal, refetchCurrentGame }) => {
  const address = useRecoilValue(addressAtom);
  const provider = useRecoilValue(providerAtom);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [ticketFee, setTicketFee] = useState(2);
  const [durationType, setDurationType] = useState("m");
  const [winMultiplier, setWinMultiplier] = useState(2);
  const [ticketingDuration, setTicketDuration] = useState(20);
  const [maxGuessNumber, setMaxGuessNumber] = useState(10000);
  const [maxPlayersAllowed, setMaxPlayersAllowed] = useState(2);
  const [ticketingStart, setTicketStart] = useState("In 10 minutes");
  const [withdrawalStart, setWithdrawalStart] = useState("1 hour after");

  const ticketingValue = () =>
    Math.round(
      Date.now() / 1000 +
        (ticketingStart === "In 10 minutes"
          ? 600
          : ticketingStart === "In 30 minutes"
          ? 1800
          : ticketingStart === "In 1 hour"
          ? 3600
          : 7200)
    );

  const withdrawalValue = () =>
    Math.round(
      Date.now() / 1000 +
        (ticketingStart === "In 10 minutes"
          ? 600
          : ticketingStart === "In 30 minutes"
          ? 1800
          : ticketingStart === "In 1 hour"
          ? 3600
          : 7200)
    ) +
    (withdrawalStart === "1 hour after"
      ? 3600
      : withdrawalStart === "2 hours after"
      ? 7200
      : withdrawalStart === "3 hours after"
      ? 10800
      : 14400);

  const startNewGame = async () => {
    if (loading) return;
    if (!address) return setError("Please connect your wallet first!");

    const params = {
      winMultiplier:
        winMultiplier > 10 ? 10 : winMultiplier < 0 ? 2 : winMultiplier,
      ticketFee: (ticketFee > 10 ? 10 : ticketFee < 0 ? 1 : ticketFee) * 1e6,
      ticketingDuration:
        durationType === "m"
          ? ticketingDuration * 60
          : ticketingDuration * 3600,

      maxGuessNumber:
        maxGuessNumber > 10000
          ? 10000
          : maxGuessNumber < 0
          ? 100
          : maxGuessNumber,
      maxPlayersAllowed:
        maxPlayersAllowed > 50
          ? 50
          : maxPlayersAllowed < 2
          ? 2
          : maxPlayersAllowed,

      gameMasterAddr: address,
      ticketingStart: ticketingValue(),
      withdrawalStart: withdrawalValue(),
    };

    setError("");
    setLoading(true);
    try {
      const txnsArr = await axios
        .post(`/endCurrentAndCreateNewGame`, params)
        .then(response => {
          console.log(response);
          return response?.data?.txns;
        });

      if (txnsArr?.length) await MultiSigner(txnsArr, provider);
      refetchCurrentGame();
      closeNewGameModal();
    } catch (error) {
      console.log(error);
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "An error occurred while creating a new game"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDurationChange = (value = ticketingDuration) => {
    setTicketDuration(
      value > (durationType === "m" ? 60 : 6)
        ? durationType === "m"
          ? 60
          : 6
        : value < (durationType === "m" ? 10 : 1)
        ? durationType === "m"
          ? 10
          : 1
        : value
    );
  };

  useEffect(() => {
    handleDurationChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationType]);

  return (
    <>
      <div className="app-modal__header no-capitalize">
        <h2>Start a new game</h2>
        <button className="close-modal-btn" onClick={closeNewGameModal}>
          <Icon.Close />
        </button>
      </div>

      <div className="app-modal__description">
        <p>Edit the parameters below to create a new game</p>
      </div>

      <div className="new-game-inputs">
        <div className="new-game-input">
          <label htmlFor="winMultiplier">Win Multiplier</label>
          <div className="input-block sm">
            <input
              min={0}
              max={10}
              type="number"
              maxLength={3}
              onBlur={e => {
                setMaxPlayersAllowed(
                  e.target.value > 10
                    ? 10
                    : e.target.value < 0
                    ? 0
                    : e.target.value
                );
              }}
              placeholder="max 10"
              name="winMultiplier"
              value={winMultiplier}
              onChange={e =>
                setWinMultiplier(
                  e.target.value > 10
                    ? 50
                    : e.target.value < 0
                    ? 2
                    : e.target.value
                )
              }
            />
          </div>
        </div>

        <div className="new-game-input">
          <label htmlFor="maxPlayersAllowed">Max Players</label>
          <div className="input-block sm">
            <input
              min={2}
              max={50}
              type="number"
              maxLength={3}
              onBlur={e => {
                setMaxPlayersAllowed(
                  e.target.value > 50
                    ? 50
                    : e.target.value < 2
                    ? 2
                    : e.target.value
                );
              }}
              placeholder="max 50"
              name="maxPlayersAllowed"
              value={maxPlayersAllowed}
              onChange={e =>
                setMaxPlayersAllowed(
                  e.target.value > 50
                    ? 50
                    : e.target.value < 0
                    ? 0
                    : e.target.value
                )
              }
            />
          </div>
        </div>

        <div className="new-game-input">
          <label htmlFor="maxGuessNumber">Max Guess Number</label>
          <div className="input-block">
            <input
              min={100}
              max={10000}
              type="number"
              maxLength={5}
              name="maxGuessNumber"
              onBlur={e => {
                setMaxGuessNumber(
                  e.target.value > 10000
                    ? 10000
                    : e.target.value < 100
                    ? 100
                    : e.target.value
                );
              }}
              value={maxGuessNumber}
              placeholder="max 10000"
              onChange={e =>
                setMaxGuessNumber(
                  e.target.value > 10000 ? 10000 : e.target.value
                )
              }
            />
          </div>
        </div>

        <div className="new-game-input">
          <label htmlFor="ticketFee">Ticket Fee</label>
          <div className="input-block ticket">
            <input
              type="number"
              placeholder="min 1"
              name="ticketFee"
              maxLength={3}
              value={ticketFee}
              onBlur={e => {
                setTicketFee(
                  e.target.value > 20
                    ? 20
                    : e.target.value < 1
                    ? 1
                    : e.target.value
                );
              }}
              onChange={e =>
                setTicketFee(e.target.value > 20 ? 20 : e.target.value)
              }
            />
            <div style={{ paddingBottom: 2 }}>
              <Icon.AlgoRound size={15} />
            </div>
          </div>
        </div>

        <div className="new-game-input">
          <label htmlFor="ticketFee">Ticketing Duration</label>

          <div className="time-options">
            <div className="time-option">
              <input
                min={0}
                max={60}
                type="number"
                value={ticketingDuration}
                onBlur={e => handleDurationChange(e.target.value)}
                onChange={e =>
                  e.target.value.length < 4 &&
                  setTicketDuration(
                    e.target.value > (durationType === "m" ? 60 : 6)
                      ? durationType === "m"
                        ? 60
                        : 6
                      : e.target.value < 0
                      ? 0
                      : e.target.value
                  )
                }
              />
            </div>

            <div className="time-option">
              <Menu
                menuButton={
                  <button className="select-btn">
                    <p>{durationType === "m" ? "Mins" : "Hrs"}</p>

                    <Icon.CaretDownBold size={9} color={"#23232380"} />
                  </button>
                }
                align="end"
                transition
                direction="top"
                offsetY={8}
                offsetX={8}
                unmountOnClose={true}
                onItemClick={e => {
                  setDurationType(e.value);
                }}
                menuClassName="time-picker"
              >
                <MenuItem
                  value={"m"}
                  className={`time-picker-item ${
                    durationType === "m" ? "active" : ""
                  }`}
                >
                  <p>Mins</p>
                </MenuItem>
                <MenuItem
                  value={"h"}
                  className={`time-picker-item ${
                    durationType === "h" ? "active" : ""
                  }`}
                >
                  <p>Hrs</p>
                </MenuItem>
              </Menu>
            </div>
          </div>
        </div>

        <div className="new-game-input">
          <label htmlFor="ticketingStart">Ticketing starts</label>

          <div className="time-options">
            <div className="time-option">
              <Menu
                menuButton={
                  <button className="select-btn">
                    <p>{ticketingStart}</p>
                    <Icon.CaretDownBold size={9} color={"#23232380"} />
                  </button>
                }
                align="end"
                transition
                direction="top"
                offsetY={8}
                offsetX={8}
                unmountOnClose={true}
                onItemClick={e => {
                  setTicketStart(e.value);
                }}
                menuClassName="time-picker wide"
              >
                {ticketingOptions?.map((item, index) => {
                  return (
                    <MenuItem
                      key={index}
                      value={item}
                      className={`time-picker-item ${
                        ticketingStart === item ? "active" : ""
                      }`}
                    >
                      <p>{item}</p>
                    </MenuItem>
                  );
                })}
              </Menu>
            </div>
          </div>
        </div>

        <div className="new-game-input">
          <label htmlFor="withdrawalStart">Withdrawal starts</label>

          <div className="time-options">
            <div className="time-option">
              <Menu
                menuButton={
                  <button className="select-btn">
                    <p>{withdrawalStart}</p>
                    <Icon.CaretDownBold size={9} color={"#23232380"} />
                  </button>
                }
                align="end"
                transition
                direction="top"
                offsetY={8}
                offsetX={8}
                unmountOnClose={true}
                onItemClick={e => {
                  setWithdrawalStart(e.value);
                }}
                menuClassName="time-picker wide"
              >
                {withdrawalOptions?.map((item, index) => {
                  return (
                    <MenuItem
                      key={index}
                      value={item}
                      className={`time-picker-item ${
                        withdrawalStart === item ? "active" : ""
                      }`}
                    >
                      <p>{item}</p>
                    </MenuItem>
                  );
                })}
              </Menu>
            </div>
          </div>
        </div>

        {loading && (
          <div className="loading-overlay">
            <SpinnerCircular size={50} color="#777" secondaryColor="#ccc" />
          </div>
        )}
      </div>

      {!!error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <button
        className={
          "connect-wallet-btn" +
          (!!error ? " error" : "") +
          (loading ? " loading" : "")
        }
        onClick={startNewGame}
      >
        {loading ? "Creating New Game..." : "Create Game"}
      </button>
    </>
  );
};

export default NewGameModal;
