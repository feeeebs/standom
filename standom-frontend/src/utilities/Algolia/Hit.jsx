import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
//import AddNewFavoriteLyricsToDb from "../../components/AddNewFavoriteLyricsToDb";


export const Hit = ({ hit }) => {

  const navigate = useNavigate();

  const handleLyricClick = () => {
    console.log('running handleLyricClick');
    navigate(`/add-lyrics/${hit.objectID}`);
  }
  
  // TO DO: add album art for each hit using <img src={hit.album_art} />
  return (
    <div>
        <h6 dangerouslySetInnerHTML={{__html: hit.lyric}}></h6>
        <p>{hit.song_title}</p>
        <p>{hit.album_title}</p>
        <Button onClick={handleLyricClick}
          //onClick={() => sendEvent('click', hit, 'Song Added to Favorites')}
          //onClick={AddNewFavoriteLyricsToDb(hit.lyric.lyric_id)}
          >Choose Lyric</Button>
    </div>
  );
};

// ML2EM12EABS