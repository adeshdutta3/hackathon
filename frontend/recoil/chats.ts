import { atom } from "recoil";

export const chatsState = atom<any[]>({
  key: "chatsState",        // unique ID (must be unique across atoms/selectors)
  default: [],              // initial value
});
