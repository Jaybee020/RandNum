import Icon from "../../components/common/Icon";
import HomeBet from "./HomeBet";

const HomeRecentBets = () => {
  return (
    <div className="home-page__recent-bets">
      <div className="home-page__recent-bets__header">
        <div className="home-page__recent-bets__header-content">
          <p>Recent bets</p>
          <Icon.SoftStar />
        </div>
      </div>

      <div className="home-page__recent-bets__cards">
        {[1, 2, 3].map((item, index) => (
          <HomeBet key={index} />
        ))}
      </div>
    </div>
  );
};

export default HomeRecentBets;
