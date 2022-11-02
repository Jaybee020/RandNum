import "./index.scss";
import _ from "lodash";
import axios from "axios";
import { useQuery } from "react-query";
import LottoDetails from "./LottoDetails";
import LottoUserActions from "./LottoUserActions";
import Navbar from "../../components/layout/Navbar";
import EmptyState from "../../components/common/EmptyState";

const Lotto = () => {
  const { data, isLoading, error } = useQuery(
    "CurrentGame",
    () =>
      axios.get(`/currentGameParams`).then(response => response?.data?.data),
    { refetchOnWindowFocus: false, retry: 2 }
  );

  return (
    <div className="lotto-page-main">
      <Navbar />

      <h2 className="lotto-page-title">Next game</h2>
      <LottoUserActions lottoDetails={data} />
      <div className="lotto-page">
        {isLoading ? (
          <EmptyState title={"Fetching current game"} />
        ) : error ? (
          <EmptyState
            isError
            title={"An error occurred while fetching game"}
            description={error?.message}
          />
        ) : (
          !!data && (
            <>
              <LottoDetails
                data={{
                  ..._.pick(
                    data,
                    "ticketingStart",
                    "ticketingDuration",
                    "ticketFee"
                  ),
                  "current-phase":
                    data?.ticketingStart + data?.ticketingDuration,
                }}
                withdrawalStart={data?.withdrawalStart}
              />

              <LottoDetails
                data={_.pick(
                  data,
                  "luckyNumber",
                  "withdrawalStart",
                  "playersTicketBought",
                  "playersTicketChecked"
                )}
              />
            </>
          )
        )}
      </div>
    </div>
  );
};

export default Lotto;
