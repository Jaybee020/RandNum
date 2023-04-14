import millify from "millify";
import Skeleton from "react-loading-skeleton";
import Icon from "../../components/common/Icon";
import { useApp } from "../../context/AppContext";
import { useWindowWidth } from "@react-hook/window-size/throttled";

const HistoryStats = () => {
  const windowWidth = useWindowWidth();
  const { betsHistory, fetching, errorHistory, ticketSold, mostRecurring } =
    useApp();

  return (
    <>
      {/* <div className="page-title">
        <h2 className="page-title-text">Gaming history</h2>
      </div> */}

      <div className="history-page__stats">
        <div className="history-page__stat">
          <p>Total games played</p>
          <div className="row">
            <h2>
              {fetching || errorHistory ? (
                <Skeleton
                  width={110}
                  height={24}
                  highlightColor={"#ccc"}
                  enableAnimation={!errorHistory}
                />
              ) : (
                (betsHistory?.length ?? 0) + " games"
              )}{" "}
            </h2>
          </div>
        </div>

        <div className="history-page__stat">
          <p>Tickets bought</p>
          <div className="row">
            {fetching || errorHistory ? (
              <h2>
                {" "}
                <Skeleton
                  width={110}
                  height={24}
                  highlightColor={"#ccc"}
                  enableAnimation={!errorHistory}
                />
              </h2>
            ) : (
              <>
                <Icon.Algo />
                <h2>
                  {!isNaN(ticketSold) &&
                    millify(ticketSold, {
                      precision: 1,
                    })}
                </h2>
              </>
            )}
          </div>
        </div>

        <div className="history-page__stat amt-paid">
          <p>Most recurring</p>
          <div className="row">
            <h2>
              {fetching || errorHistory ? (
                <Skeleton
                  width={110}
                  height={24}
                  highlightColor={"#ccc"}
                  enableAnimation={!errorHistory}
                />
              ) : (
                mostRecurring ?? "N/A"
              )}
            </h2>
          </div>
        </div>
        <div className="history-page__stat no-fill">
          <p>Recent game</p>
          {fetching || errorHistory ? (
            <h2>
              <Skeleton
                width={110}
                height={24}
                highlightColor={"#ccc"}
                enableAnimation={!errorHistory}
              />
            </h2>
          ) : (
            <a
              href={`https://testnet.algoexplorer.io/tx/${
                (betsHistory || [])[0]?.txReference
              }`}
              rel="noreferrer"
              target="_blank"
              className="row"
            >
              <Icon.ArrowUpRight
                size={
                  windowWidth > 858
                    ? "22px"
                    : windowWidth > 570
                    ? "20px"
                    : "15px"
                }
              />
            </a>
          )}
        </div>
      </div>
    </>
  );
};
export default HistoryStats;
