import { isValidAddress } from "algosdk";
import axios from "axios";
import avatars from "../assets/avatars";

const randAvatar = index => avatars[index];

const constrictAddr = (address, start = 5, end = 5) => {
  if (address && typeof address === "string") {
    return (
      address.substring(0, start) +
      "..." +
      address.substring(address.length - end, address.length)
    );
  }
};

const getBalance = async address => {
  if (!isValidAddress(address)) return 0;

  try {
    const balance = await axios
      .get(`https://node.testnet.algoexplorerapi.io/v2/accounts/${address}`)
      .then(res => res?.data?.amount / 1e6);

    return balance;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export { randAvatar, getBalance, constrictAddr };
