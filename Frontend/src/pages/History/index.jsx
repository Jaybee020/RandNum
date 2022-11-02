import "./index.scss";
import HistoryStats from "./HistoryStats";
import Navbar from "../../components/layout/Navbar";
import AppTable from "../../components/common/AppTable";

const index = () => (
  <div className="history-page">
    <Navbar />
    <HistoryStats />
    <AppTable />
  </div>
);

export default index;
