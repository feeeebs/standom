import { useCollection } from '@squidcloud/react';
import React, { useState, useEffect } from 'react'
import { Button, Card, ListGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { addNewFavoriteLyrics, updateLyricsFetched } from '../utilities/Redux/lyricsSlice';
import Search from '../utilities/Algolia/Search';
import { useNavigate } from 'react-router-dom';

export default function MyFavoriteLyrics() {

    const [lyricInfo, setLyricInfo] = useState([]);

    const dispatch = useDispatch();
    const userId = useSelector(state => state.user.userInfo.id);
    const lyricsFetched = useSelector(state => state.lyrics.fetched);

    const lyricsCollection = useCollection('song_lyrics', 'postgres_id');
    const favoritesCollection = useCollection('users_favorite_lyrics', 'postgres_id');
    const songsCollection = useCollection('songs', 'postgres_id');
    const albumsCollection = useCollection('albums', 'postgres_id');

    const navigate = useNavigate();

    useEffect(() => {
      console.log('lyric info: ', lyricInfo);

    }, [lyricInfo])

    // queries to fetch lyric, song, and album data for user's favorites
    useEffect(() => {
      if (!lyricsFetched) {
          const getFavorites = async () => {
            try {
              // get list of favorites
              const favoritesSnapshot = await favoritesCollection
                .query()
                .eq('user_id', userId)
                .dereference()
                .snapshot();
                // console.log('favoritesSnapshot: ', favoritesSnapshot);

                // array to stage lyric data before updating state
                const newLyricBucket = [];

                favoritesSnapshot.forEach(favoritesRow => {
                  const lyricId = favoritesRow.lyric_id;
                  //console.log('favorites data: ', favoritesRow.data);

                  // look up lyric data based on user's specific list of favorites
                  const getLyrics = async () => {
                    const lyricSnapshot = await lyricsCollection
                      .query()
                      .eq('lyric_id', lyricId)
                      .dereference()
                      .snapshot();
                    const { lyric, song_id } = lyricSnapshot[0];
                    // console.log('lyric: ', lyric);

                    const songSnapshot = await songsCollection
                      .query()
                      .eq('song_id', song_id)
                      .dereference()
                      .snapshot();
                    const { song_title , album_id } = songSnapshot[0];
                    // console.log('song: ', song_title);

                    const albumSnapshot = await albumsCollection
                      .query()
                      .eq('album_id', album_id)
                      .dereference()
                      .snapshot();
                    const album_title = albumSnapshot[0].album_title;
                    // console.log('album: ', album_title);

                    // Create object to store song title, album title, and lyric
                    const lyricObject = {
                      songTitle: song_title,
                      albumTitle: album_title,
                      lyric: lyric
                    }
                    // add lyric to favorites array
                    dispatch(addNewFavoriteLyrics([lyric]));
                    newLyricBucket.push(lyricObject)
                  }
                  getLyrics();

                })
                // update state with new lyric entry
                setLyricInfo(newLyricBucket);
                dispatch(updateLyricsFetched());
            } catch (error) {
              console.error('Error fetching favorite lyrics: ', error);
            }
          };
      
      getFavorites();

      }
    }, [lyricsFetched, favoritesCollection, lyricsCollection, userId]);

    // WHY DOES REMOVING THIS UNUSED VARIABLE / USESELECTOR CALL BREAK THINGS???
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const favoriteLyrics = useSelector(state => state.lyrics.favoriteLyrics);

  const handleClick = () => {
      console.log('running handleLyricClick');
      navigate('/lyric-search');
    }


  // TO DO: ALLOW USER TO DELETE FAVORITES
  // TO DO: FILTER OUT FAVORITES THAT HAVE ALREADY BEEN ADDED OR MAKE SURE IT DOESN'T ADD DUPE ENTRIES
  // TO DO: DISPLAY ALBUM ART ON SONG CARD
  // TO DO: MAKE IT PRETTIER
  // TO DO: INCLUDE "WHY YOU LOVE IT" TAGS - use badges to display?
  // TO DO: ADD FILTERS AND SORTING BY ALBUM/SONG
  
  return (
    <Card>
      <Card.Body>
        <h2 className='text-center mb-4'>My Favorite Lyrics</h2>
          <Button onClick={handleClick}>Add New Lyrics</Button>
          <ListGroup>
            {lyricInfo.map((lyric, index) => (
              <ListGroup.Item 
                key={index}
                className='d-flex justify-content-between align-items-start'
              >
                <div className='ms-2 me-auto'>
                    <div className='fw-bold'>{lyric.songTitle}</div>
                    <div style={{ whiteSpace: 'pre-line' }}>{lyric.lyric}</div>
                    <div>{lyric.albumTitle}</div>
                  </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
      </Card.Body>
    </Card>
  )
}