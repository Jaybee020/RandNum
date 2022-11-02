import { decodeAddress } from "algosdk";
import axios from "axios";
import avatars from "../assets/avatars";

const randAvatar = () => avatars[Math.floor(Math.random() * avatars.length)];

const constrictAddr = (address, start = 5, end = 5) => {
  if (address && typeof address === "string") {
    return (
      address.substring(0, start) +
      "..." +
      address.substring(address.length - end, address.length)
    );
  }
};

const getBalance = async (
  address = "IYG2CGWR36BMBDSE4BOIXD7UZZJAT5QETQONOACDQUZWWDZFMJX6QJA6II"
) => {
  if (!address) return 0;

  try {
    decodeAddress(address);
  } catch {
    return 0;
  }

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
