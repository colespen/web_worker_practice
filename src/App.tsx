import { useEffect, useMemo, useRef, useState } from "react";
import { processList } from "./longProcesses/enums";

import Loader from "./components/Loader";

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
  const [profileList, setProfileList] = useState<ProfileListType>({
    loading: true,
    list: [],
    page: 1,
  });

  // initialize new web worker
  // wrapped to return cached value on subsequent calls which prevents re-initialization on re-renders
  const counter: Worker = useMemo(
    // pass in new instance of generated URL that contains path to count worker file --- import.meta.url:
    // returns URL of current module's file and ensures that count.ts is loaded relative to current module's file location
    () => new Worker(new URL("./longProcesses/count.ts", import.meta.url)),
    []
  );

  const getData: Worker = useMemo(
    () => new Worker(new URL("./longProcesses/getData.ts", import.meta.url)),
    []
  );

  // postMessage - send
  // runs count worker on first re-render - checks if user's browser supports web workers before posting message
  useEffect(() => {
    if (window.Worker) {
      // use initialized counter to post message to count worker
      counter.postMessage(processList.count); // "count"
    }
  }, [counter]);

  // onmessage - recieve
  // set LengthCount state
  useEffect(() => {
    if (window.Worker) {
      // listening to messages
      counter.onmessage = (e: MessageEvent<string>) => {
        setLengthCount((prev) => ({
          ...prev,
          loading: false,
          value: Number(e.data) && Number(e.data),
        }));
      };
    }
  }, [counter]);

  // postMessage - send to getData worker on inital render
  useEffect(() => {
    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: "initial",
        thePageNumber: profileList.page,
      } as GetDataType;

      getData.postMessage(JSON.stringify(request));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // onmessage - recieve from getData worker
  useEffect(() => {
    if (window.Worker) {
      getData.onmessage = (e: MessageEvent<string>) => {
        const response = JSON.parse(e.data) as unknown as ProfileListType;

        setProfileList((prev) => ({
          ...prev,
          loading: response.loading,
          list: response.list,
          page: response.page,
        }));
      };
    }
  }, [getData]);

  return (
    <main className="main-container">
      <section className="count">
        Total count of Profiles is{" "}
        <b>{lengthCount.loading ? <Loader size={14} /> : lengthCount.value}</b>
      </section>
      <section className="table-container"></section>
    </main>
  );
};

export default App;
