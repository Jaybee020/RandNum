import React from "react";
import Icon from "./Icon";

const BetHistoryDetails = ({ closeHistoryTab }) => {
  const data = {
    "bet-id": "A5TUP-KL94",
    "lucky-no": "27",
    "amount-staked": "230",
    "amount-won": "230",
    started: "12 Oct, 2022",
    closed: "13 Oct, 2022",
  };

  return (
    <>
      <div className="app-modal__header">
        <h2>Details</h2>
        <button className="close-modal-btn" onClick={closeHistoryTab}>
          <Icon.Close />
        </button>
      </div>

      <div className="bet-details">
        <ul className="bet-details__list">
          {Object.keys(data)?.map((key, ind) => (
            <li className="bet-details__list-item" key={ind}>
              <p className="key">{key}</p>
              {key !== "amount-won" ? (
                <p className="value">{data[key]}</p>
              ) : (
                <div className="amount-won">
                  <Icon.AlgoRound />
                  {(ind + Math.ceil(Math.random() * 10)) % 3 === 0 ? (
                    <p className="indicator indicator-success">
                      {Math.ceil(Math.random() * 1000)}
                    </p>
                  ) : (
                    <p className="indicator indicator-failed">
                      {Math.ceil(Math.random() * 1000)}
                    </p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default BetHistoryDetails;
