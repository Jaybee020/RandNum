import Icon from "./Icon";
import Searchbar from "../Searchbar";
import CsvDownloader from "react-csv-downloader";
import useAppMenu from "../../hooks/useAppMenu";
import useAppModal from "../../hooks/useAppModal";
import BetHistoryDetails from "./BetHistoryDetails";

const AppTable = () => {
  const csvData = [
    {
      id: "025HG-76H8",
      amount: "180",
      winners: 7,
      started: "26 Sep, 2022",
      closed: "10 Oct, 2022",
    },
    {
      id: "A5TUP-KL94",
      amount: "230",
      winners: 7,
      started: "12 Oct, 2022",
      closed: "13 Oct, 2022",
    },
  ];

  const mostkeys = csvData.sort(
    (a, b) => Object.keys(b).length - Object.keys(a).length
  )[0];

  const columns = Object.keys(mostkeys).map((item, i) => {
    return { id: item, displayName: item };
  });

  const [AppMenu, activeOption] = useAppMenu("all", [
    "all",
    "date",
    "category",
    "status",
  ]);
  const [BetHistoryTab, openHistoryTab, closeHistoryTab] = useAppModal();

  return (
    <>
      <div className="app-table-header">
        <h2 className="app-table-header__title">Game history</h2>
        <div className="app-table-header__row">
          <Searchbar />

          <div className="action-btns">
            <AppMenu>
              <button className="action-btn">
                <Icon.Filter />
                <p>{activeOption}</p>
              </button>
            </AppMenu>

            <CsvDownloader
              separator=";"
              datas={csvData}
              extension=".csv"
              columns={columns}
              filename={`address-gaming-history`}
            >
              <button className="action-btn download">
                <p>Download CSV</p>
              </button>
            </CsvDownloader>
          </div>
        </div>
      </div>

      <div className="app-table">
        <div className="app-table__row app-table__row__header">
          <div className="app-table__row__item betId">Bet Id</div>
          <div className="app-table__row__item amt">Amount In</div>
          <div className="app-table__row__item amt">Amount Paid</div>
          <div className="app-table__row__item winners">Winners</div>
          <div className="app-table__row__item walletAddr">Top winner</div>
          <div className="app-table__row__item date">Started</div>
          <div className="app-table__row__item date">Closed</div>
        </div>

        {
          true
            ? [1, 2, 3, 4, 5]?.map((bet, index) => {
                return (
                  <div
                    key={index}
                    onClick={openHistoryTab}
                    className="app-table__row"
                  >
                    <div className="app-table__row__item betId">
                      <p>0A51C-544B</p>
                    </div>

                    <div className="app-table__row__item amt">
                      <Icon.AlgoRound />
                      <p>{bet * Math.ceil(Math.random() * 1000)}</p>
                    </div>

                    <div className="app-table__row__item amt">
                      <Icon.AlgoRound />
                      <p>{bet * Math.ceil(Math.random() * 1000)}</p>
                    </div>

                    <div className="app-table__row__item winners">
                      <p>{bet * Math.ceil(Math.random() * 10)}</p>
                    </div>

                    <div className="app-table__row__item walletAddr">
                      <p>IYG2C...JA6YI</p>
                    </div>

                    <div className="app-table__row__item date">
                      <p>18 Sep, '22</p>
                    </div>

                    <div className="app-table__row__item date">
                      <p>26 Sep, '22</p>
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

      <BetHistoryTab>
        <BetHistoryDetails closeHistoryTab={closeHistoryTab} />
      </BetHistoryTab>
    </>
  );
};

export default AppTable;
