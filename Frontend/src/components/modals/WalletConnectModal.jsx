import { useState } from "react";
import { useSetRecoilState } from "recoil";
import { addressAtom, providerAtom } from "../../atoms/appState";
import Icon from "../common/Icon";
import { MyAlgoInst, PeraInst } from "../../utils";

const WalletConnectModal = ({ closeConnectModal }) => {
  const [option, setOption] = useState("");
  const setWalletAddress = useSetRecoilState(addressAtom);
  const setWalletProvider = useSetRecoilState(providerAtom);

  const connectWallet = async provider => {
    let wallet;
    if (provider === "myAlgo") {
      wallet = MyAlgoInst;
    } else if (provider === "pera") {
      wallet = PeraInst;
    }

    try {
      const addr = await wallet.connect();
      setWalletAddress(addr);
      setWalletProvider(provider);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="app-modal__header">
        <h2>Connect wallet</h2>
        <button className="close-modal-btn" onClick={closeConnectModal}>
          <Icon.Close />
        </button>
      </div>

      <div className="app-modal__description">
        <p>Select a platform to continue</p>
      </div>

      <div className="connect-wallet-options">
        {[
          { type: "pera", name: "Pera wallet" },
          { type: "myAlgo", name: "My Algo wallet" },
        ].map((opt, index) => {
          return (
            <div
              key={index}
              className="connect-wallet-option"
              onClick={() => setOption(opt?.type)}
            >
              <div className="connect-wallet-option__details">
                {Icon[opt.type]()}
                <p>{opt.name}</p>
              </div>
              <div className="connect-wallet-option__radio">
                {opt.type === option ? <Icon.Checked /> : null}
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="connect-wallet-btn"
        onClick={() => {
          if (!!option) connectWallet(option);
        }}
      >
        Continue
      </button>
    </>
  );
};

export default WalletConnectModal;
