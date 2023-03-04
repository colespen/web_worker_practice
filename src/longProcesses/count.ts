// Web Worker to check array lengths

/* eslint-disable no-restricted-globals */
import { profiles } from "../data";
import { processList } from "./enums";

// onmessage event fired when a message has been posted to the worker file
self.onmessage = (e: MessageEvent<string>) => {
  //check if equiv to count enum
  if (e.data === processList.count) {
    const findLength = profiles.length;

    self.postMessage(findLength);
  }
};

// export empty obj to prevent TypeScript from throwing error
export {};