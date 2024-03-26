import { useCollection } from '@squidcloud/react';
import React, { useState, useEffect } from 'react'
import { Button, Card, ListGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { addNewFavoriteLyrics, updateLyricsFetched } from '../utilities/Redux/lyricsSlice';
import { useNavigate } from 'react-router-dom';
import FetchAlbumArtFromS3 from '../utilities/FetchAlbumArt';

export default function MyFavoriteLyrics() {

    const [lyricInfo, setLyricInfo] = useState([]);

    const dispatch = useDispatch();
    const userId = useSelector(state => state.user.userInfo.id);
    const lyricsFetched = useSelector(state => state.lyrics.fetched);

    const lyricsCollection = useCollection('song_lyrics', 'postgres_id');
    const favoritesCollection = useCollection('users_favorite_lyrics', 'postgres_id');
    const songsCollection = useCollection('songs', 'postgres_id');
    const albumsCollection = useCollection('albums', 'postgres_id');
    // const userTagsCollection = useCollection('user_lyric_tags', 'postgres_id');

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
                  const { lyric_id } = favoritesRow;
                  console.log('favorites data: ', favoritesRow);

                  // look up lyric data based on user's specific list of favorites
                  const getLyrics = async () => {
                    const lyricSnapshot = await lyricsCollection
                      .query()
                      .eq('lyric_id', lyric_id)
                      .dereference()
                      .snapshot();
                    const { lyric, song_id } = lyricSnapshot[0];
                    console.log('lyric: ', lyric);

                    //TO DO: QUERY FOR LYRIC TAGS; ADD TAGS TO LYRIC ARRAY; INCLUDE LOGIC FOR IF SNAPSHOT IS EMPTY
                    // const userLyricTagsSnapshot = await userTagsCollection
                    //   .query()
                    //   .eq('favorite_id', favorite_id)
                    //   .dereference()
                    //   .snapshot();
                    // console.log('userLyricTagSnap: ', userLyricTagsSnapshot);

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
                    const { album_title, album_art_key } = albumSnapshot[0];
                    console.log('album: ', album_title);
                    console.log('album art key: ', album_art_key);

                    // get album art from S3
                    const albumArtUrl = await FetchAlbumArtFromS3(album_art_key);

                    // Create object to store song title, album title, and lyric
                    const lyricObject = {
                      songTitle: song_title,
                      albumTitle: album_title,
                      lyric: lyric,
                      albumArtUrl: albumArtUrl,
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
    }, [lyricsFetched, favoritesCollection, lyricsCollection, userId, lyricInfo]);

    // WHY DOES REMOVING THIS UNUSED VARIABLE / USESELECTOR CALL BREAK THINGS???
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const favoriteLyrics = useSelector(state => state.lyrics.favoriteLyrics);

  const handleClick = () => {
      console.log('running handleLyricClick');
      navigate('/lyric-search');
    }


  // TO DO: ALLOW USER TO DELETE FAVORITES
  // TO DO: FILTER OUT FAVORITES THAT HAVE ALREADY BEEN ADDED OR MAKE SURE IT DOESN'T ADD DUPE ENTRIES
  // TO DO: MAKE IT PRETTIER
  // TO DO: INCLUDE "WHY YOU LOVE IT" TAGS - use badges to display?
  // TO DO: ADD FILTERS AND SORTING BY ALBUM/SONG
  
  return (
    <Card>
      <Card.Body>
        <h2 className='text-center mb-4'>My Favorite Lyrics</h2>
          <Button className='mb-2' onClick={handleClick}>Add New Lyrics</Button>
          <ListGroup>
            {lyricInfo.map((lyric, index) => (
              <ListGroup.Item 
                key={index}
                className='d-flex justify-content-between align-items-start rounded-3'
                style={{ border: '1px solid #dee2e6', marginBottom: '10px', padding: '10px' }}
              >
                <div className='ms-2 me-auto'>
                    <div className='fw-bold'>{lyric.songTitle}</div>
                    <div style={{ whiteSpace: 'pre-line' }}>{lyric.lyric}</div>
                </div>
                <div>
                    {lyric.albumArtUrl && (
                    <div>
                      <img 
                        src={URL.createObjectURL(lyric.albumArtUrl)} 
                        alt='Album Art'
                        style={{ width: '100px', height: '100px '}}
                      />
                    </div>
                    )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
      </Card.Body>
    </Card>
  )
}