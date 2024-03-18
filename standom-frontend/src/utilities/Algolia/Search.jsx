import "instantsearch.css/themes/satellite.css";
import { Hits, InstantSearch, SearchBox } from "react-instantsearch";
import { Hit } from "./Hit";
import algoliaClient from "./algoliaConfig";


export default function Search() {

  // TO DO: add refinement list once albums and song titles are indexed

  return (
    <div>
      <InstantSearch indexName="song_lyrics" searchClient={algoliaClient} insights>
        <SearchBox />
        <Hits hitComponent={Hit} />
      </InstantSearch>
    </div>
  );
}
