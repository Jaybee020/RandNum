import Icon from "../../components/common/Icon";

const HistoryStats = () => {
  return (
    <div className="history-page__stats">
      <div className="history-page__stat">
        <p>Total Game Played</p>
        <div className="row">
          <h2>28 games</h2>
        </div>
      </div>
      <div className="history-page__stat">
        <p>Total Amount In</p>
        <div className="row">
          <Icon.Algo />
          <h2>183k</h2>
        </div>
      </div>
      <div className="history-page__stat amt-paid">
        <p>Total Amount Paid</p>
        <div className="row">
          <Icon.Algo />
          <h2>164k</h2>
        </div>
      </div>
      <div className="history-page__stat">
        <p>Winners/Game</p>
        <div className="row">
          <h2 className="pad">~16</h2>
        </div>
      </div>
      <div className="history-page__stat last-game">
        <p>Last Game</p>
        <div className="row">
          <h2 className="pad">17H</h2>
        </div>
      </div>
    </div>
  );
};
export default HistoryStats;
