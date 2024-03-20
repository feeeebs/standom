import "instantsearch.css/themes/satellite.css";
import { Configure, Hits, InstantSearch, SearchBox } from "react-instantsearch";
import { Hit } from "./Hit";
import algoliaClient from "./algoliaConfig";
import NoResults from "./NoResults";
import { useSelector } from "react-redux";
import EmptyQueryBoundary from "./EmptyQueryBoundary";
import AddLineBreaks from "./TransformData";
import NoResultsBoundary from "./NoResultsBoundary";

export default function Search() {
  const userId = useSelector(state => state.user.userInfo.id);
  // TO DO: add refinement list once albums and song titles are indexed

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
