import { useInstantSearch } from "react-instantsearch";

  // Handle no results
  function NoResultsBoundary({ children, fallback }) {
    const { results } = useInstantSearch();

    // The '__isArtificial' flag makes sre to not display the No Results message
    // when no hits have been returned
    if (!results.__isArtificial && results.nbHits === 0) {
      return (
        <>
          {fallback}
          <div hidden>{children}</div>
        </>
      );
    }

    return children;
  }

  export default NoResultsBoundary;