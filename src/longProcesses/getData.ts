/* eslint-disable no-restricted-globals */
import { ProfileListType, GetDataType, listPageSize } from "../App";
import { profiles } from "../data";
import { processList } from "./enums";

self.onmessage = (e: MessageEvent<string>) => {
  // `as GetDataType` is type assertion
  const data = JSON.parse(e.data) as GetDataType;

  if (data.action !== processList.getData) {
    return;
  }
  //  from itnerface: "initial" | "next" | "prev" | "pageNumber"
  if (data.period === "initial") {
    const items = profiles.filter((item, index) => index < listPageSize);

    const response = {
      loading: false,
      list: items,
      page: data.thePageNumber,
    } as ProfileListType;

    self.postMessage(JSON.stringify(response));
  }
};

export {};
