import algoliasearch from "algoliasearch/lite";
import "instantsearch.css/themes/satellite.css";
import { Hits, InstantSearch, SearchBox, Configure } from "react-instantsearch";
import { Hit } from "../utilities/Algolia/Hit";



export const Search = () => {

const searchClient = algoliasearch("CP65BSPR37", "deadada9df27054aede4356c8d7e1e94");
const index = searchClient.initIndex('song_lyrics');



  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="song_lyrics"
    >
      <Configure hitsPerPage={5} />
      <div className="ais-InstantSearch">
        <SearchBox />
        <Hits hitComponent={Hit} />
      </div>
    </InstantSearch>
  );
};