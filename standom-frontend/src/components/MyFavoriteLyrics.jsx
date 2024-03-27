import { useCollection } from '@squidcloud/react';
import React, { useState, useEffect } from 'react'
import { Badge, Button, Card, ListGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';
//import { addNewFavoriteLyrics, updateLyricsFetched } from '../utilities/Redux/lyricsSlice';
import { useNavigate } from 'react-router-dom';
import FetchAlbumArtFromS3 from '../utilities/FetchAlbumArt';
//import GetFavorites from '../utilities/GetFavorites';

export default function MyFavoriteLyrics() {

    const [lyricInfo, setLyricInfo] = useState([]);

    //const dispatch = useDispatch();
    const userId = useSelector(state => state.user.userInfo.id);
    //const lyricsFetched = useSelector(state => state.lyrics.fetched);

    const lyricsCollection = useCollection('song_lyrics', 'postgres_id');
    const favoritesCollection = useCollection('users_favorite_lyrics', 'postgres_id');
    const songsCollection = useCollection('songs', 'postgres_id');
    const albumsCollection = useCollection('albums', 'postgres_id');
    const userTagsCollection = useCollection('user_lyric_tags', 'postgres_id');
    //const lyricTagsCollection = useCollection('lyric_tags', 'postgres_id');

    const navigate = useNavigate();

    useEffect(() => {
      console.log('lyric info: ', lyricInfo);

    }, [lyricInfo])
  
    useEffect(() => {
      const subscription = favoritesCollection
        .query()
        .eq('user_id', userId)
        .dereference()
        .snapshots()
        .subscribe({
          next: (favoritesSnapshot) => {
            console.log('Got new snapshot: ', favoritesSnapshot);
            //console.log('lyric info: ', lyricInfo);

            const fetchFavorites = async () => {
              try {
                  // get list of favorites
                  const favoritesSnapshot = await favoritesCollection
                    .query()
                    .eq('user_id', userId)
                    .dereference()
                    .snapshot();
                    //console.log('favoritesSnapshot: ', favoritesSnapshot);
        
                    // array to stage lyric data before updating state
                    const newLyricBucket = [];
        
                    favoritesSnapshot.forEach(favoritesRow => {
                      const { lyric_id, favorite_id } = favoritesRow;
                      //console.log('favorites data: ', favoritesRow);
                      //console.log('favorite_id: ', favorite_id);
        
                      // look up lyric data based on user's specific list of favorites
                      const getLyrics = async () => {
                        // LYRIC
                        const lyricSnapshot = await lyricsCollection
                          .query()
                          .eq('lyric_id', lyric_id)
                          .dereference()
                          .snapshot();
                        const { lyric, song_id } = lyricSnapshot[0];
                        //console.log('lyric: ', lyric);
        
                        // LYRIC TAGS
                        const userLyricTagsSnapshot = await userTagsCollection
                          .query()
                          .eq('favorite_id', favorite_id)
                          .dereference()
                          .snapshot();
        
                        //console.log('userLyricTagSnap: ', userLyricTagsSnapshot);
        
                        const tagsBucket = [];
                        if (userLyricTagsSnapshot) {
                          userLyricTagsSnapshot.forEach(tag => {
                            // once i figure out the join, change this to tag.tag to get the actual value
                            // for now just displaying the ID to test it out
                            tagsBucket.push(tag.tag_id);
                          })
                        }
                        //console.log('tagbucket: ', tagsBucket);
        
                        // SONG
                        const songSnapshot = await songsCollection
                          .query()
                          .eq('song_id', song_id)
                          .dereference()
                          .snapshot();
                        const { song_title, album_id } = songSnapshot[0];
                        // console.log('song: ', song_title);
        
                        // ALBUM ART
                        const albumSnapshot = await albumsCollection
                          .query()
                          .eq('album_id', album_id)
                          .dereference()
                          .snapshot();
                        const { album_title, album_art_key } = albumSnapshot[0];
                        //console.log('album: ', album_title);
                        //console.log('album art key: ', album_art_key);
        
                        // get album art from S3
                        const albumArtUrl = await FetchAlbumArtFromS3(album_art_key);
        
                        // PUT IT ALL TOGETHER
                        // Create object to store song title, album title, lyric, and tags
                        const lyricObject = {
                          songTitle: song_title,
                          albumTitle: album_title,
                          lyric: lyric,
                          albumArtUrl: albumArtUrl,
                          tags: tagsBucket,
                          favoriteId: favorite_id,
                        }
                        // add lyric to favorites array
                        newLyricBucket.push(lyricObject)
                      }
                      getLyrics();
                      setLyricInfo(newLyricBucket);
                    })
                    // update state with new lyric entry
                    lyricInfo.push(newLyricBucket);
                } catch (error) {
                  console.error('Error fetching favorite lyrics: ', error);
                }
          };
  
          fetchFavorites();

          },
          error: (error) => {
            console.error('Error fetching favorites: ', error);
          }
        });

      return () => {
        subscription.unsubscribe();
      };
    }, [favoritesCollection, userId]);
  
  const handleClick = () => {
      console.log('running handleLyricClick');
      navigate('/lyric-search');
    }

  const handleDelete = (favoriteId) => {
    console.log('favorite id being deleted: ', favoriteId);
      const deleteUserFavorite = async () => {
        // delete favorite from Db
        await favoritesCollection.doc({ favorite_id: favoriteId }).delete()
        .then(() => console.log('Deleted user favorite'))
        .catch((error) => console.error('Error deleting user favorite: ', error));

        // TO DO: also gotta delete tags but code below doesn't work
            // is the issue that there are multiple docs with the same favorite_id?
        // await userTagsCollection.doc({ favorite_id: favoriteId }).delete()
        //   .then(() => console.log('Deleted user favorite tags'))
        //   .catch((error) => console.error('Error deleting user favorite tags: ', error));
      }
      deleteUserFavorite();
}


  // TO DO: FILTER OUT FAVORITES THAT HAVE ALREADY BEEN ADDED OR MAKE SURE IT DOESN'T ADD DUPE ENTRIES
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
                className='d-flex rounded-3 position-relative'
                style={{ border: '1px solid #dee2e6', marginBottom: '10px', padding: '10px' }}
              >
                <div className='flex-grow-1'>
                  <div>
                    <div className='fw-bold'>{lyric.songTitle}</div>
                    <div style={{ whiteSpace: 'pre-line' }}>{lyric.lyric}</div>
                    <div>
                      {lyric.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} className='me-1'>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='position-absolute top-0 end-0 p-2'>
                  <Button size='sm' variant='danger' onClick={() => handleDelete(lyric.favoriteId)}>x</Button>
                </div>
                <div className='ms-5'>
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