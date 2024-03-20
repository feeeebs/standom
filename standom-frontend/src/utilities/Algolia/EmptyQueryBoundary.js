import { useInstantSearch } from "react-instantsearch";

  // Handle empty queries -- display nothing for empty queries
  function EmptyQueryBoundary({ children, fallback }) {
    const { indexUiState } = useInstantSearch();

    if (!indexUiState.query) {
      return fallback;
    }

    return children;
  }

  export default EmptyQueryBoundary;