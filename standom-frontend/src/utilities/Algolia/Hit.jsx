import { Highlight } from "react-instantsearch";

export const Hit = ({ hit }) => {
  // TO DO: add album art for each hit using <img src={hit.album_art} />
  // TO DO: add song title for each hit as <h1>{hit.title}</h1>
  //        <h6><Highlight attribute='lyric' hit={hit} /></h6>
  return (
    <article>
        <h6 dangerouslySetInnerHTML={{__html: hit.lyric}}></h6>
        <p>{hit.song_title}</p>
        <p>{hit.album_title}</p>
    </article>
  );
};