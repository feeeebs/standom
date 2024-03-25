import "instantsearch.css/themes/satellite.css";
import { Configure, Hits, InstantSearch, SearchBox } from "react-instantsearch";
import { Hit } from "./Hit";
import algoliaClient from "./algoliaConfig";
import NoResults from "./NoResults";
import { useSelector } from "react-redux";
import EmptyQueryBoundary from "./EmptyQueryBoundary";
import AddLineBreaks from "./TransformData";
import NoResultsBoundary from "./NoResultsBoundary";
import aa from "search-insights";



export default function Search() {
  const userId = useSelector(state => state.user.userInfo.id);

  aa('init', {
    appId: 'CP65BSPR37',
    apiKey: 'feba20fc91fc49627d18750bad32e87b'
  })
  
  aa('setAuthenticatedUserToken', userId)


    // TO DO: add refinement lists / filters for albums and songs
  return (
    <div>
      <InstantSearch 
        indexName="song_lyrics" 
        searchClient={algoliaClient} 
        insights={true}
      >
        <Configure userToken={userId} clickAnalytics />
          <SearchBox autoFocus={true}/>
            <EmptyQueryBoundary fallback={null}>
              <NoResultsBoundary fallback={<NoResults />}>
                <Hits hitComponent={Hit} transformItems={(items) => AddLineBreaks(items)}/>
              </NoResultsBoundary>
            </EmptyQueryBoundary>
      </InstantSearch>
    </div>
  );
}
