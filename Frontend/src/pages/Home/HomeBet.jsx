import dayjs from "dayjs";
import Icon from "../../components/common/Icon";
import { constrictAddr } from "../../utils/helpers";

const HomeBet = ({ bet }) => {
  return (
    <div className="home-page__recent-bets__card">
      <div className="header">
        <div className="header__row">
          <div className="header__row__betId">
            <p>{constrictAddr(bet?._id)}</p>
          </div>
        </div>
        <div className="header__row">
          <div className="header__row__luckyNo">
            <Icon.Dawn />
            <p>Lucky No: </p>
            <p>{bet?.gameParams?.luckyNumber}</p>
          </div>
        </div>
      </div>

      <div className="details">
        <div className="details__row">
          <p>Started</p>
          <p>
            {!isNaN(bet?.gameParams?.ticketingStart) &&
              dayjs(bet?.gameParams?.ticketingStart * 1000).format(
                "HH:mm, MMM DD"
              )}
          </p>
        </div>
        <div className="details__row">
          <p>Closed</p>
          <p>
            {!isNaN(bet?.gameParams?.ticketingDuration) &&
              dayjs(
                (bet?.gameParams?.ticketingStart +
                  bet?.gameParams?.ticketingDuration) *
                  1000
              ).format("HH:mm, MMM DD")}
          </p>
        </div>
        <div className="details__row">
          <p>Txn Reference</p>
          <a
            target="_blank"
            rel="noreferrer"
            href={
              bet?.txReference
                ? `https://testnet.algoexplorer.io/tx/${bet?.txReference}`
                : ""
            }
          >
            {bet?.txReference && constrictAddr(bet?.txReference)}
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomeBet;
