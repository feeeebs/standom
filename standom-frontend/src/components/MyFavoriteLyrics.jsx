import { useCollection } from '@squidcloud/react';
import React, { useState, useEffect } from 'react'
import { Button, Card, ListGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addNewFavoriteLyrics } from '../utilities/Redux/lyricsSlice';


// TO DO -- reformat into a table and make it prettier
// TO DO -- include "why you love it tags"

export default function MyFavoriteLyrics() {
// get array of current user's favorite lyrics from database
    const [error, setError] = useState();
    const [dataFetched, setDataFetched] = useState(false);
    const navigate = useNavigate();

    const dispatch = useDispatch();
    const userId = useSelector(state => state.user.userInfo.id);

    const lyricsCollection = useCollection('song_lyrics', 'postgres_id');
    const favoritesCollection = useCollection('users_favorite_lyrics', 'postgres_id');

    let trackLoop = 1;
    // query favorites table for favorite lyrics
    useEffect(() => {
      if (!dataFetched) {
          const getFavorites = async () => {
            try {
              // get list of favorites from DB
              const favoritesSnapshot = await favoritesCollection
                .query()
                .eq('user_id', userId)
                .snapshot();

                // for each favorite, get the lyric text from the song_lyrics table using the lyric_id
                favoritesSnapshot.forEach(favoritesRow => {
                  const lyricId = favoritesRow.data.lyric_id;

                  console.log('loop has run: ', trackLoop);
                  trackLoop += 1;
                  // look up lyric
                  const getLyrics = async () => {
                    const lyricSnapshot = await lyricsCollection
                      .query()
                      .eq('lyric_id', lyricId)
                      .snapshot();

                    // save the lyric text
                    const lyric = lyricSnapshot[0].data.lyric;
                    console.log('lyric: ', lyric);
                    // add lyric to favorites array
                    dispatch(addNewFavoriteLyrics([lyric]));
                  }
                  getLyrics();
                })
                setDataFetched(true);
            } catch (error) {
              console.error('Error fetching favorite lyrics: ', error);
            }
          };
      
      getFavorites();

      }
    }, [dataFetched, favoritesCollection, lyricsCollection, userId, dispatch]);

    // get the final list of favorites
    const favoriteLyrics = useSelector(state => state.lyrics.favoriteLyrics);


    async function handleNav() {
        setError('')
        try {
          navigate("/add-lyrics")
        } catch {
          setError('Something went wrong. Try again in a minute.', error)
        }
        
      }

  return (
    <Card>
      <Card.Body>
        <h2 className='text-center mb-4'>My Favorite Lyrics</h2>
          <ListGroup>
            {favoriteLyrics.map((lyric, index) => (
              <ListGroup.Item key={index}>{lyric}</ListGroup.Item>
            ))}
          </ListGroup>
      </Card.Body>
      <Button onClick={handleNav}>Add more lyrics</Button>
    </Card>
  )
}