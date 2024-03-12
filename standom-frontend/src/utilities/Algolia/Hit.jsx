import { Highlight } from "react-instantsearch";
import { getPropertyByPath } from 'instantsearch.js/es/lib/utils';

export const Hit = ({ hit }) => {
  return (
    <article>
        <img src={hit.poster_path} />
        <div className="hit-title">
            <Highlight attribute="title" hit={hit} />
        </div>
        <div className="hit-release_date">
            <Highlight attribute="release_date" hit={hit} />
        </div>
        <div className="hit-original_language">
            <Highlight attribute="original_language" hit={hit} />
        </div>
    </article>
  );
};