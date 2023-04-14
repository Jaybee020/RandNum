import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

const storageEffect =
  key =>
  ({ onSet }) => {
    onSet(newValue => {
      localStorage.setItem(key, newValue);
    });
  };

export const addressAtom = atom({
  default: "",
  key: "address",
  effects_UNSTABLE: [persistAtom],
});
export const providerAtom = atom({
  default: "",
  key: "provider",
  effects_UNSTABLE: [persistAtom],
});
