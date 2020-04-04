import React from 'react';

/**
 * https://www.robinwieruch.de/react-hooks-fetch-data/
 * @param {*} state
 * @param {*} action
 */
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        hasError: false,
        error: null
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        hasError: false,
        error: null,
        data: action.payload
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        hasError: true,
        error: action.payload
      };
    default:
      throw new Error();
  }
};

/**
 *
 * @param {*} fetch Async function that returns data
 * @param {*} updateProps Similar to `useEffect` dependencies, you can add any values here that invalidate the result of `fetch`
 */
export function useLoader(fetch, updateProps = []) {
  // memoize the fetch
  const fetchRef = React.useRef(fetch);
  React.useEffect(() => {
    fetchRef.current = fetch;
  }, [fetchRef, fetch]);
  // Using a reducer helps remove the `state` dependency from the effect below
  // React guarantees that `dispatch` is unique accross renders.
  // https://overreacted.io/a-complete-guide-to-useeffect/#why-usereducer-is-the-cheat-mode-of-hooks
  const [state, dispatch] = React.useReducer(dataFetchReducer, {
    error: null,
    isLoading: true,
    data: null
  });

  const fetchDataCallback = React.useCallback(async () => {
    dispatch({ type: 'FETCH_INIT' });

    try {
      const data = await fetchRef.current();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_FAILURE', payload: error });
    }
  }, [fetchRef]); // never changes
  // useLoader will fetch Data when updateProps changes
  React.useEffect(() => {
    fetchDataCallback();
  }, [fetchDataCallback, ...updateProps]); // eslint-disable-line react-hooks/exhaustive-deps
  // returned for use in your component
  return {
    ...state,
    hasError: !!state.error,
    refresh: fetchDataCallback
  };
}
