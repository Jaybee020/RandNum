import Icon from "../../components/common/Icon";
import { constrictAddr } from "../../utils/helpers";

const HomeBet = () => {
  return (
    <div className="home-page__recent-bets__card">
      <div className="header">
        <div className="header__row">
          <div className="header__row__betId">
            <p>0a51c-544b</p>
          </div>
        </div>
        <div className="header__row">
          <div className="header__row__luckyNo">
            <Icon.Dawn />
            <p>Lucky No -</p>
            <p>48</p>
          </div>
        </div>
      </div>

      <div className="details">
        <div className="details__row">
          <p>Started</p>
          <p>04:00, Oct 26</p>
        </div>
        <div className="details__row">
          <p>Closed</p>
          <p>23:46, Oct 27</p>
        </div>
        <div className="details__row">
          <p>Top Winner</p>
          <p>
            {constrictAddr(
              "IYG2CGWR36BMBDSE4BOIXD7UZZJAT5QETQONOACDQUZWWDZFMJX6QJA6II"
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeBet;
