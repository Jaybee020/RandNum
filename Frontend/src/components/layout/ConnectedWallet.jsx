import Icon from "../common/Icon";
import { Menu, MenuItem } from "@szhsin/react-menu";
import { useRecoilState, useSetRecoilState } from "recoil";
import { constrictAddr, randAvatar } from "../../utils/helpers";
import { addressAtom, providerAtom } from "../../atoms/appState";

const ConnectedWallet = () => {
  const setWalletProvider = useSetRecoilState(providerAtom);
  const [walletAddress, setWalletAddress] = useRecoilState(addressAtom);

  const onDisconnect = () => {
    setWalletAddress();
    setWalletProvider();
  };

  return (
    <>
      <div className="connected-wallet">
        <div className="img-cover">
          <img src={randAvatar()} alt="" />
        </div>
        <p className="address">{constrictAddr(walletAddress) || ""}</p>

        <Menu
          align="end"
          transition
          menuButton={
            <button className="options-btn">
              <Icon.CaretDown />
            </button>
          }
          menuClassName="app-menu wallet"
        >
          <MenuItem
            data-active={!!1}
            className="menu-item"
            onClick={onDisconnect}
          >
            <p>Disconnect</p>
          </MenuItem>
        </Menu>
      </div>
    </>
  );
};

export default ConnectedWallet;
