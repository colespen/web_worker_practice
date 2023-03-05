import { useRef, useEffect } from "react";

type Props = {
  page: number;
  pages: number;
  pageClick: (page: number) => void;
  prevHandler: () => void;
  nextHandler: () => void;
};

const Pagination = ({
  page,
  pages,
  pageClick,
  prevHandler,
  nextHandler,
}: Props) => {
  
  const focusedElementRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    // Get the current focused element
    const focusedElement = focusedElementRef.current;

    // Scroll the focused element into view when it changes and the element exists
    if (focusedElement) {
      focusedElement.scrollIntoView({ behavior: "smooth" });
    }
  }, [page, focusedElementRef]);

  return (
    <div className="pagination-container">
      <button className="prev" onClick={prevHandler} disabled={page === 1}>
        Prev
      </button>
      <ul className="pages-container">
        {Array.from(Array(Math.ceil(pages)).keys()).map((x, i) => {
          return (
            <li
              key={i}
              ref={page - 1 === i ? focusedElementRef : null}
              className={page - 1 === i ? "active page-item" : "page-item"}
              onClick={() => {
                pageClick(x + 1);
              }}
            >
              {x + 1}
            </li>
          );
        })}
      </ul>
      <button className="next" onClick={nextHandler} disabled={page === pages}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
