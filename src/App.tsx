import React, { useEffect, useMemo, useRef, useState } from "react";
import { processList } from "./longProcesses/enums";

type LengthCountType = {
  loading: boolean;
  value: number;
};

export type ProfileType = {
  albumId: number | string;
  id: number | string;
  title: string;
  url: string;
  thumbnailUrl: string;
};

export type ProfileListType = {
  loading: boolean;
  list: unknown & Array<ProfileType>;
  page: number;
};

export type GetDataType = {
  action: string;
  period: "initial" | "next" | "prev" | "pageNumber";
  thePageNumber: number;
};

export const listPageSize = 50;

const App = () => {
  const [lengthCount, setLengthCount] = useState<LengthCountType>({
    loading: true,
    value: 0,
  });

  // wrapped to return cached value on subsequent calls 
  const counter: Worker = useMemo(
    // initialize new web worker
    // import.meta.url returns URL of current module's file and ensures that count.ts is loaded relative to current module's file location
    () => new Worker(new URL("./longProcesses/count.ts", import.meta.url)),
    []
  );

  useEffect(() => {
    if (window.Worker) {
      // use initialized counter to post message tp count worker
      counter.postMessage(processList.count); // "count"
    }
  }, [counter]);

  useEffect(() => {
    if (window.Worker) {
      counter.onmessage = (e: MessageEvent<string>) => {
        setLengthCount((prev) => ({
          ...prev,
          loading: false,
          value: Number(e.data) && Number(e.data),
        }));
      };
    }
  }, [counter]);



  return (
    <main className="main-container">
      <section className="count"></section>
      <section className="table-container"></section>
    </main>
  );
};

export default App;
