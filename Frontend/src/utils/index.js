import { PeraWalletConnect } from "@perawallet/connect";
import MyAlgoWallet from "@randlabs/myalgo-connect";
import { ALGOD_CLIENT } from "./constants";

export class Pera {
  wallet = new PeraWalletConnect();

  constructor(network) {
    this.client = ALGOD_CLIENT[network];
  }

  async connect() {
    try {
      const addresses = await this.wallet.connect();
      this.wallet.connector?.on("disconnect", this.disconnect);
      // localStorage.setItem("address", addresses[0]);
      // localStorage.setItem("provider", "PeraWallet");
      return addresses[0];
    } catch (err) {
      if (err?.data?.type !== "CONNECT_MODAL_CLOSED") {
        throw new Error("Error encountered");
      } else {
        throw new Error(err.message);
      }
    }
  }

  async disconnect() {
    await this.wallet.disconnect();
    localStorage.removeItem("address");
    localStorage.removeItem("provider");
  }

  async signTransaction(txn) {
    const singleTxnGroups = [{ txn: txn }];
    try {
      const signedTxn = await this.wallet.signTransaction([singleTxnGroups]);
      return await this.client.sendRawTransaction(signedTxn).do();
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

export class MyAlgo {
  wallet = new MyAlgoWallet();

  constructor(network) {
    this.client = ALGOD_CLIENT[network];
  }

  async connect() {
    try {
      const accounts = await this.wallet.connect({
        shouldSelectOneAccount: true,
      });
      // localStorage.setItem("address", accounts[0].address);
      // localStorage.setItem("provider", "MyAlgo");
      return accounts[0].address;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async signTransaction(txn) {
    try {
      const signedTxn = await this.wallet.signTransaction(txn.toByte());
      return await this.client.sendRawTransaction(signedTxn.blob).do();
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

export const PeraInst = new Pera("testnet");
export const MyAlgoInst = new MyAlgo("testnet");
