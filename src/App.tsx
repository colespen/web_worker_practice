import { useEffect, useMemo, useState } from "react";
import Loader from "./components/Loader";
import Table from "./components/Table";
import Pagination from "./components/Pagination";
import { ProfileListType, GetDataType } from "./types";
import { processList } from "./longProcesses/enums";

type LengthCountType = {
  loading: boolean;
  value: number;
};

export const listPageSize = 15;

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

  /////////////////////////////////////////////////////////////////////
  ////// initialize new web workers
  ///////////////////////////////////////////////////////////////////

  // wrapped to return cached value on subsequent calls which prevents re-initialization on re-renders
  const counter: Worker = useMemo(
    // pass in new instance of generated URL that contains path to count worker file --- import.meta.url:
    // returns URL of current module's file and ensures that count.ts is loaded relative to current module's file location
    () => {
      const worker = new Worker(
        new URL("./longProcesses/count.ts", import.meta.url)
      );
      worker.onerror = (error) => error;
      return worker;
    },
    []
  );

  const getData: Worker = useMemo(
    () => {
      const worker = new Worker(new URL("./longProcesses/getData.ts", import.meta.url));
      worker.onerror = (error) => error;
      return worker;
    },
    []
  );

  /////////////////////////////////////////////////////////////////////
  ////// counter web worker
  ///////////////////////////////////////////////////////////////////

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

  /////////////////////////////////////////////////////////////////////
  ////// getData web worker
  ///////////////////////////////////////////////////////////////////

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

  /////////////////////////////////////////////////////////////////////
  ////// event handlers - Pagination
  ///////////////////////////////////////////////////////////////////

  const handlePageNumber = (userSelectedPage: number) => {
    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: "pageNumber",
        thePageNumber: userSelectedPage,
      } as GetDataType;

      getData.postMessage(JSON.stringify(request));
    }
  };

  const prevHandler = (userSelectedPage: number) => {
    if (profileList.page === 1) {
      return;
    }

    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: "prev",
        thePageNumber: userSelectedPage - 1,
      } as GetDataType;

      getData.postMessage(JSON.stringify(request));
    }
  };

  const nextHandler = (userSelectedPage: number, thePageLength: number) => {
    if (userSelectedPage < thePageLength) {
      if (window.Worker) {
        const request = {
          action: processList.getData,
          period: "next",
          thePageNumber: userSelectedPage + 1,
        } as GetDataType;

        getData.postMessage(JSON.stringify(request));
      }
    }
  };

  return (
    <main className="main-container">
      <section className="count">
        Total count of Profiles is{" "}
        <b>{lengthCount.loading ? <Loader size={14} /> : lengthCount.value}</b>
      </section>
      <section className="table-container">
        {profileList.loading ? (
          <Loader size={40} display="block" />
        ) : (
          <>
            <Table list={profileList.list} />
            <Pagination
              page={profileList.page}
              pages={lengthCount.value / listPageSize}
              pageClick={(pageNumber) => {
                handlePageNumber(pageNumber);
              }}
              prevHandler={() => prevHandler(profileList.page)}
              nextHandler={() =>
                nextHandler(profileList.page, lengthCount.value / listPageSize)
              }
            />
          </>
        )}
      </section>
    </main>
  );
};

export default App;
