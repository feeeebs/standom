import "instantsearch.css/themes/satellite.css";
import { Configure, Hits, InstantSearch, SearchBox, useInstantSearch } from "react-instantsearch";
import { Hit } from "./Hit";
import algoliaClient from "./algoliaConfig";
import NoResults from "./NoResults";
import { useSelector } from "react-redux";

export default function Search() {
  const userId = useSelector(state => state.user.userInfo.id);
  // TO DO: add refinement list once albums and song titles are indexed

  // Set user token

  // Handle empty queries -- display nothing for empty queries
  function EmptyQueryBoundary({ children, fallback }) {
    const { indexUiState } = useInstantSearch();

    if (!indexUiState.query) {
      return fallback;
    }

    return children;
  }

  function AddLineBreaks(items) {
    // Transform the items to replace line breaks
    return items.map(hit => {
      console.log('original lyric: ', hit.lyric);
      const transformedLyric = hit.lyric.replace(/\n/g, '<br>');
      console.log('transformed lyric: ', transformedLyric);

      return {
        ...hit,
        lyric: transformedLyric
      }
    });
  }

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


  return (
    <div>
      <InstantSearch 
        indexName="song_lyrics" 
        searchClient={algoliaClient} 
        insights={true}
      >
        <Configure userToken={userId} />
          <SearchBox />
            <EmptyQueryBoundary fallback={null}>
              <NoResultsBoundary fallback={<NoResults />}>
                <Hits hitComponent={Hit} transformItems={(items) => AddLineBreaks(items)}/>
              </NoResultsBoundary>
            </EmptyQueryBoundary>
      </InstantSearch>
    </div>
  );
}
