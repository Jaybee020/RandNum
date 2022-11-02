import Icon from "../common/Icon";
import { useRecoilValue } from "recoil";
import ConnectedWallet from "./ConnectedWallet";
import useAppModal from "../../hooks/useAppModal";
import { addressAtom } from "../../atoms/appState";
import WalletConnectModal from "../../hooks/WalletConnectModal";

const Navbar = () => {
  const walletAddress = useRecoilValue(addressAtom);
  const [ConnectModal, openConnectModal, closeConnectModal] = useAppModal();

  return (
    <>
      <div className="app-navbar">
        <div className="logo">
          <Icon.Logo />
        </div>

        {walletAddress ? (
          <ConnectedWallet />
        ) : (
          <button className="connect-wallet-btn" onClick={openConnectModal}>
            <p>Connect Wallet</p>
          </button>
        )}
      </div>

      {!walletAddress && (
        <ConnectModal isCentered={true}>
          <WalletConnectModal closeConnectModal={closeConnectModal} />
        </ConnectModal>
      )}
    </>
  );
};

export default Navbar;
