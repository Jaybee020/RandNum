import React from "react";
import Icon from "./Icon";

const ProfileBetDetails = ({ closeDetailsTab }) => {
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
        <button className="close-modal-btn" onClick={closeDetailsTab}>
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

        <div className="section-header">
          <h2>Activities</h2>
        </div>

        <div className="bet-activities">
          <div className="bet-activities-group">
            <div className="bet-activities-group__header">October 17, 2022</div>
            <ul className="bet-activities-group__list">
              {[1, 2, 3].map((item, _i) => {
                return (
                  <li key={_i} className="bet-activities-group__list-item">
                    <div className="block ">
                      <div className="block-icon">
                        {Icon[_i === 0 ? "SoftStar" : "ArrowsLR"]()}
                      </div>
                      <div className="block-content">
                        <p>{_i === 0 ? "Placed bet" : "Changed number"}</p>
                        <p className="key">03:13 PM</p>
                      </div>
                    </div>

                    <div className="block ">
                      {_i !== 0 && (
                        <div className="block-content values">
                          <p className="key">89</p>
                          {Icon["ArrowLeft"]()}
                          <p className="key">23</p>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileBetDetails;
