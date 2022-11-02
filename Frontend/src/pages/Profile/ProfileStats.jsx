import _ from "lodash";
import millify from "millify";
import { useEffect, useState } from "react";
import Icon from "../../components/common/Icon";
import { constrictAddr, getBalance, randAvatar } from "../../utils/helpers";

const ProfileStats = ({ txnHistory, addr }) => {
  const [stats, setStats] = useState(null);

  const processTxns = async () => {
    const currentProfile = _.groupBy(txnHistory?.receivedTxns, "sender")[addr];
    const gamesWon = _.groupBy(txnHistory?.sentTxns, "receiver")[addr];

    const amountSpent = _.sumBy(currentProfile, function (obj) {
      return obj["payment-transaction"]?.amount;
    });
    const profit = _.sumBy(gamesWon, function (obj) {
      return obj["payment-transaction"]?.amount;
    });

    const balance = await getBalance(addr);

    setStats({
      amountSpent: amountSpent / 1e6,
      pnl: (profit - amountSpent) / 1e6,
      gamesPlayed: currentProfile?.length,
      gamesLost: (currentProfile?.length || 0) - (gamesWon?.length || 0),
      balance,
    });
  };

  useEffect(() => {
    processTxns();
  }, []);

  return (
    <div className="profile-page__stats">
      <div className="profile-page__info">
        <div className="profile-page__info__image-cover">
          <img src={randAvatar()} alt="" />
        </div>
        <div className="profile-page__info__details">
          <p>{constrictAddr(addr)}</p>
          <div className="row">
            <Icon.Algo />
            <h2>
              {!isNaN(stats?.balance) &&
                millify(stats?.balance, { precision: 1 })}
            </h2>
          </div>
        </div>
      </div>

      <div className="profile-page__stat played">
        <p>Games Played</p>
        <div className="row">
          <h2>{stats?.gamesPlayed}</h2>
        </div>
      </div>

      <div className="profile-page__stat amt-paid">
        <p>Amount spent</p>
        <div className="row">
          <Icon.Algo />
          <h2>
            {!isNaN(stats?.amountSpent) &&
              millify(stats?.amountSpent, { precision: 1 })}
          </h2>
        </div>
      </div>

      <div className="profile-page__stat">
        <p>Total PnL</p>
        <div className="row pnl">
          <Icon.Algo />
          <h2 data-profit={stats?.pnl > 0}>
            {!isNaN(stats?.pnl) && millify(stats?.pnl, { precision: 1 })}
          </h2>
        </div>
      </div>

      <div className="profile-page__stat fav">
        <p>Games Lost</p>
        <div className="row">
          <h2>{stats?.gamesLost}</h2>
        </div>
      </div>
    </div>
  );
};
export default ProfileStats;
