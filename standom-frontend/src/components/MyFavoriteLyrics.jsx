import { useCollection } from '@squidcloud/react';
import React, { useState, useEffect } from 'react'
import { Badge, Button, Card, ListGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FetchAlbumArtFromS3 from '../utilities/FetchAlbumArt';

export default function MyFavoriteLyrics() {

    const [lyricInfo, setLyricInfo] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = useSelector(state => state.user.userInfo.id);

    const lyricsCollection = useCollection('song_lyrics', 'postgres_id');
    const favoritesCollection = useCollection('users_favorite_lyrics', 'postgres_id');
    const songsCollection = useCollection('songs', 'postgres_id');
    const albumsCollection = useCollection('albums', 'postgres_id');
    const userTagsCollection = useCollection('user_lyric_tags', 'postgres_id');
    const lyricTagsCollection = useCollection('lyric_tags', 'postgres_id');

    const navigate = useNavigate();

    // log lyricInfo when it changes
    useEffect(() => {
      console.log('lyric info: ', lyricInfo);
      console.log('lyric info length: ', lyricInfo.length);

    }, [lyricInfo]);

    // log loading state when it changes
    useEffect(() => {
      console.log('loading state: ', loading);
    }, [loading]);

    
    // subscribe to changes in favoritesCollection
    // get fresh favorites from DB when changes are detected
    useEffect(() => {
      const favoritesSubscription = favoritesCollection
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
                  setLoading(true);
                  // array to stage lyric data before updating state
                  const newLyricBucket = [];
      
                  const promises = favoritesSnapshot.map(async (favoritesRow) => {
                    const { lyric_id, favorite_id } = favoritesRow;
                    //console.log('favorites data: ', favoritesRow);
                    //console.log('favorite_id: ', favorite_id);
      
                    // look up lyric data based on user's specific list of favorites
                      // LYRIC
                      const lyricSnapshot = await lyricsCollection
                        .query()
                        .eq('lyric_id', lyric_id)
                        .dereference()
                        .snapshot();
                      const { lyric, song_id } = lyricSnapshot[0];
                      const lyricOb = { lyricId: lyric_id, lyric: lyric };
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
                        for (const tagRow of userLyricTagsSnapshot) {
                          //console.log('searching for tag id: ', tagRow.tag_id);
                          const tagSnap = await lyricTagsCollection
                          .query()
                          .eq('tag_id', tagRow.tag_id)
                          .dereference()
                          .snapshot();
                        //console.log('tag snapshot: ', tagSnap);
                        const { tag_id, tag } = tagSnap[0];
                        //console.log('tag: ', tag);
                        const tagObject = { tagId: tag_id, tag: tag };
                        
                        tagsBucket.push(tagObject);
                        }
                        
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
                        lyric: lyricOb,
                        albumArtUrl: albumArtUrl,
                        tags: tagsBucket,
                        favoriteId: favorite_id,
                      }
                      // add lyric to favorites array
                      newLyricBucket.push(lyricObject);
                    });

                    await Promise.all(promises);
 
                  // update state with new lyric entry
                  setLyricInfo(newLyricBucket);
                  setLoading(false);
              } catch (error) {
                console.error('Error fetching favorite lyrics: ', error);
                setLoading(false);
              }
          };
  
          fetchFavorites();

          },
          error: (error) => {
            console.error('Error fetching favorites: ', error);
          }
        });

      return () => {
        favoritesSubscription.unsubscribe();
      };
    }, [favoritesCollection, userId, userTagsCollection]);

  
  const handleClick = () => {
      console.log('running handleLyricClick');
      navigate('/lyric-search');
  }

  
  const handleEdit = (lyricObject) => {
    navigate(`/edit-favorite/${lyricObject.favoriteId}`, { state: { lyricObject } });
  }
  

  // TO DO: FILTER OUT FAVORITES THAT HAVE ALREADY BEEN ADDED OR MAKE SURE IT DOESN'T ADD DUPE ENTRIES
  // TO DO: INCLUDE "WHY YOU LOVE IT" TAGS - use badges to display?
  // TO DO: ADD FILTERS AND SORTING BY ALBUM/SONG
  
  return (
    <Card>
      <Card.Body>
        <h2 className='text-center mb-4'>My Favorite Lyrics</h2>
          <Button className='mb-2' onClick={handleClick}>Add New Lyrics</Button>
          {loading ? (
            <div className='text-center mb-3'>In search of glorious happenings of happenstance...</div>
          ) : (
          <ListGroup>
            {lyricInfo.length > 0 ? (
            lyricInfo.map((lyric, index) => (
              <ListGroup.Item 
                key={index}
                className='d-flex rounded-3 position-relative'
                style={{ border: '1px solid #dee2e6', marginBottom: '10px', padding: '10px' }}
              >
                <div className='flex-grow-1'>
                  <div>
                    <div className='fw-bold'>{lyric.songTitle}</div>
                    <div style={{ whiteSpace: 'pre-line' }}>{lyric.lyric.lyric}</div>
                    <div>
                      {lyric.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} className='me-1'>
                          {tag.tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='position-absolute top-0 end-0 p-2'>
                    <Button size='sm' onClick={() => handleEdit(lyric)}>Edit</Button>
                </div>
                <div className='ms-5 mt-4'>
                    {lyric.albumArtUrl && (
                    <div>
                      <img 
                        src={URL.createObjectURL(lyric.albumArtUrl)} 
                        alt='Album Art'
                        style={{ width: '115px', height: '115px '}}
                      />
                    </div>
                    )}
                </div>
              </ListGroup.Item>
            ))
            ) : (
              <>
              <div>You haven't saved any favorites yet.</div>
              <div>Try searching "aurora borealis green"</div>
              </>
            )}
          </ListGroup>
          )}
      </Card.Body>
    </Card>
  )
}