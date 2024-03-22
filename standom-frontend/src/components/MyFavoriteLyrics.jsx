import { useCollection } from '@squidcloud/react';
import React, { useState, useEffect } from 'react'
import { Button, Card, ListGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addNewFavoriteLyrics, updateLyricsFetched } from '../utilities/Redux/lyricsSlice';
import Search from '../utilities/Algolia/Search';


// TO DO -- reformat into a table and make it prettier
// TO DO -- include "why you love it tags"

export default function MyFavoriteLyrics() {
// get array of current user's favorite lyrics from database
    const [error, setError] = useState();
    const [lyrics, setLyrics] = useState([]);

    const navigate = useNavigate();

    const dispatch = useDispatch();
    const userId = useSelector(state => state.user.userInfo.id);
    const lyricsFetched = useSelector(state => state.lyrics.fetched);

    const lyricsCollection = useCollection('song_lyrics', 'postgres_id');
    const favoritesCollection = useCollection('users_favorite_lyrics', 'postgres_id');

    useEffect(() => {
      console.log('lyrics: ', lyrics);
    }, [lyrics])

    // query favorites table for favorite lyrics
    useEffect(() => {
      if (!lyricsFetched) {
          const getFavorites = async () => {
            try {
              // get list of favorites from DB
              const favoritesSnapshot = await favoritesCollection
                .query()
                .eq('user_id', userId)
                .snapshot();
                console.log('favoritesSnapshot: ', favoritesSnapshot);

                // for each favorite, get the lyric text from the song_lyrics table using the lyric_id
                const lyricBucket = [];
                favoritesSnapshot.forEach(favoritesRow => {
                  const lyricId = favoritesRow.data.lyric_id;
                  //console.log('favorites data: ', favoritesRow.data);

                  // look up lyric
                  const getLyrics = async () => {
                    const lyricSnapshot = await lyricsCollection
                      .query()
                      .eq('lyric_id', lyricId)
                      .snapshot();

                      console.log('lyricSnapshot: ', lyricSnapshot);

                    // save the lyric text
                    const lyric = lyricSnapshot[0].data.lyric;
                    console.log('lyric: ', lyric);
                    // add lyric to favorites array
                    dispatch(addNewFavoriteLyrics([lyric]));
                    lyricBucket.push(lyric);
                  }
                  getLyrics();

                })
                setLyrics(lyricBucket);
                dispatch(updateLyricsFetched());
            } catch (error) {
              console.error('Error fetching favorite lyrics: ', error);
            }
          };
      
      getFavorites();

      }
    }, [lyricsFetched, favoritesCollection, lyricsCollection, userId]);

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
            {lyrics.map((lyric, index) => (
              <ListGroup.Item key={index}>{lyric}</ListGroup.Item>
            ))}
          </ListGroup>
      </Card.Body>
      <Search />
      <Button onClick={handleNav}>Add more lyrics</Button>
    </Card>
  )
}