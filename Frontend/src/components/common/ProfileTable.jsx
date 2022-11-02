import Icon from "./Icon";
import Searchbar from "../Searchbar";
import CsvDownloader from "react-csv-downloader";
import useAppMenu from "../../hooks/useAppMenu";
import useAppModal from "../../hooks/useAppModal";
import ProfileBetDetails from "./ProfileBetDetails";
import { useEffect, useState } from "react";
import _ from "lodash";
import dayjs from "dayjs";

const ProfileTable = ({ profileData }) => {
  const [BetDetailsTab, openDetailsTab, closeDetailsTab] = useAppModal();
  const [AppMenu, activeOption] = useAppMenu("all", [
    "all",
    "date",
    "category",
    "status",
  ]);

  const mostkeys = (profileData || [])?.sort(
    (a, b) => Object.keys(b).length - Object.keys(a).length
  )[0];
  const columns = Object.keys(mostkeys || {}).map((item, i) => {
    return { id: item, displayName: item };
  });

  //
  const [data, setData] = useState([]);
  const processData = async () => {
    const summarizedArr = [];
    const grouped = _.groupBy(profileData, "lottoId");

    for (const games in grouped) {
      const filtered = grouped[games]?.filter(game =>
        ["enter_game", "change_guess_number"].includes(game.action)
      )[0]?.value;

      summarizedArr.push({
        ...grouped[games][0],
        numGuessed: filtered,
      });
    }

    setData(summarizedArr);

    console.log(summarizedArr);
  };

  useEffect(() => {
    processData();
  }, []);

  return (
    <>
      <div className="app-table-header">
        <h2 className="app-table-header__title">Gaming history</h2>
        <div className="app-table-header__row">
          <Searchbar />

          <div className="action-btns">
            <AppMenu>
              <button className="action-btn">
                <Icon.Filter />
                <p>{activeOption}</p>
              </button>
            </AppMenu>

            {profileData?.length > 0 && (
              <CsvDownloader
                separator=";"
                datas={profileData}
                extension=".csv"
                columns={columns}
                filename={`address-gaming-history`}
              >
                <button className="action-btn download">
                  <p>Download CSV</p>
                </button>
              </CsvDownloader>
            )}
          </div>
        </div>
      </div>

      <div className="app-table">
        <div className="app-table__row app-table__row__header">
          <div className="app-table__row__item betId">Bet Id</div>
          <div className="app-table__row__item lucky-no">Lucky No</div>
          <div className="app-table__row__item amt staked">Amount Staked</div>
          <div className="app-table__row__item guessed">Num Guessed</div>
          <div className="app-table__row__item amt">Amount P/L</div>
          <div className="app-table__row__item date">Closed</div>
        </div>

        {
          data?.length > 0
            ? data?.map((bet, index) => {
                return (
                  <div
                    key={index}
                    className="app-table__row"
                    onClick={openDetailsTab}
                  >
                    <div className="app-table__row__item betId">
                      <p>{bet?.lottoId}</p>
                    </div>

                    <div className="app-table__row__item lucky-no">
                      {!(bet?.lottoParams?.withdrawalStart > 0) ? (
                        <p className="indicator indicator-inactive">Pending</p>
                      ) : (
                        bet?.lottoParams?.luckyNumber
                      )}
                    </div>

                    <div className="app-table__row__item amt staked">
                      {!!bet?.lottoParams?.ticketFee ? (
                        <>
                          <Icon.AlgoRound />
                          <p>{bet?.lottoParams?.ticketFee}</p>
                        </>
                      ) : (
                        <p className="indicator indicator-inactive">--</p>
                      )}
                    </div>

                    <div className="app-table__row__item guessed">
                      <p>{bet?.numGuessed}</p>
                    </div>

                    <div className="app-table__row__item amt">
                      {!!bet?.lottoParams?.ticketFee ? (
                        bet?.lottoParams?.luckyNumber === bet?.numGuessed ? (
                          <>
                            <Icon.AlgoRound />
                            <p className="indicator indicator-success">
                              {bet?.lottoParams?.ticketFee * 10}
                            </p>
                          </>
                        ) : (
                          <>
                            <Icon.AlgoRound />
                            <p className="indicator indicator-failed">
                              {bet?.lottoParams?.ticketFee}
                            </p>
                          </>
                        )
                      ) : (
                        <p className="indicator indicator-inactive">Pending</p>
                      )}
                    </div>

                    <div className="app-table__row__item date">
                      <p>
                        {!isNaN(bet?.lottoParams?.withdrawalStart) &&
                          dayjs(
                            Number(bet?.lottoParams?.withdrawalStart) * 1000
                          ).format("HH:mm, MMM DD")}
                      </p>
                    </div>
                  </div>
                );
              })
            : null
          // <div className="filtered_list-empty">
          //   <Vectors.search dark={theme === "dark"} />
          //   <p>No {txnsFilter} transactions on current page</p>
          // </div>
        }
      </div>

      <BetDetailsTab>
        <ProfileBetDetails closeDetailsTab={closeDetailsTab} />
      </BetDetailsTab>
    </>
  );
};

export default ProfileTable;
