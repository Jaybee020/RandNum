import "./index.scss";
import HomeRecentBets from "./HomeRecentBets";
import HomeDescription from "./HomeDescription";

const Home = () => (
  <div className="home-page">
    <HomeDescription />
    <HomeRecentBets />
  </div>
);

export default Home;
