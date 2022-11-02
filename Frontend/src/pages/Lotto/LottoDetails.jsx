import dayjs from "dayjs";
import Icon from "../../components/common/Icon";

const LottoDetails = ({ data, withdrawalStart }) => {
  const dateProperties = ["ticketingStart", "withdrawalStart"];

  return (
    <>
      <div className="lotto-page__details">
        <ul className="bet-details__list">
          {Object.keys(data)?.map((key, ind) => (
            <li className="bet-details__list-item" key={ind}>
              <p className="key">{key}</p>

              {key === "ticketFee" ? (
                <div className="amount-value">
                  <Icon.AlgoRound />
                  <p className="value">{data[key] / 1e6}</p>
                </div>
              ) : key === "ticketingDuration" ? (
                <p className="value">{data[key] / 60 + " min"}</p>
              ) : dateProperties.includes(key) ? (
                <p className="value">
                  {dayjs(Number(data[key]) * 1000).format("HH:mm, MMM DD")}
                </p>
              ) : key !== "current-phase" ? (
                <p className="value">{data[key]}</p>
              ) : (
                <div className="amount-value">
                  {Date.now() - withdrawalStart * 1000 >= 0 ? (
                    <p className="indicator indicator-inactive"> Withdrawal</p>
                  ) : Date.now() - Number(data[key]) * 1000 >= 0 ? (
                    <p className="indicator indicator-success">Live</p>
                  ) : Date.now() - data?.ticketingStart * 1000 ? (
                    <p className="indicator indicator-pending">Ticketing</p>
                  ) : (
                    <p className="indicator indicator-inactive">Waiting</p>
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

export default LottoDetails;
