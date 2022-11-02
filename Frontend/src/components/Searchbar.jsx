import Icon from "./common/Icon";

const Searchbar = () => {
  return (
    <div className="search-bar">
      <div className="search-bar__icon">
        <Icon.Search />
      </div>
      <input type="text" placeholder="Search transactions" />
    </div>
  );
};

export default Searchbar;
