import "instantsearch.css/themes/satellite.css";
import { Hits, InstantSearch, SearchBox, useInstantSearch } from "react-instantsearch";
import { Hit } from "./Hit";
import algoliaClient from "./algoliaConfig";
import NoResults from "./NoResults";


export default function Search() {

  // TO DO: add refinement list once albums and song titles are indexed

  // Handle empty queries -- display nothing for empty queries
  function EmptyQueryBoundary({ children, fallback }) {
    const { indexUiState } = useInstantSearch();

    if (!indexUiState.query) {
      return fallback;
    }

    return children;
  }

  // Handle no results
  function NoResultsBoundary({ children, fallback }) {
    const { results } = useInstantSearch();

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

  return (
    <div>
      <InstantSearch indexName="song_lyrics" searchClient={algoliaClient} insights>
        <SearchBox />
          <EmptyQueryBoundary fallback={null}>
            <NoResultsBoundary fallback={<NoResults />}>
              <Hits hitComponent={Hit} />
            </NoResultsBoundary>
          </EmptyQueryBoundary>
      </InstantSearch>
    </div>
  );
}
