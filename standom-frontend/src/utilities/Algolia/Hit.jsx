export const Hit = ({ hit }) => {
  
  // TO DO: add album art for each hit using <img src={hit.album_art} />
  return (
    <article>
        <h6 dangerouslySetInnerHTML={{__html: hit.lyric}}></h6>
        <p>{hit.song_title}</p>
        <p>{hit.album_title}</p>
    </article>
  );
};