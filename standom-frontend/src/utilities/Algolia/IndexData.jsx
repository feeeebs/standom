import { useEffect, useState } from 'react';
import client from './algoliaConfig';
import { useCollection } from '@squidcloud/react';
import { useSelector } from 'react-redux';

export function IndexData() {
    const [songs, setSongs] = useState([]);
    const lyricCollection = useCollection('song_lyrics', 'postgres_id');
    const songsCollection = useCollection('songs', 'postgres_id');
    const albumsCollection = useCollection('albums', 'postgres_id');
    const userId = useSelector(state => state.user.userInfo.id);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // fetch all lyrics and all songs
                const [ lyricSnapshot, songsSnapshot, albumSnapshot ] = await Promise.all([
                    lyricCollection.query().dereference().snapshot(),
                    songsCollection.query().dereference().snapshot(),
                    albumsCollection.query().dereference().snapshot()
                ])

                const songsWithLyricsAndAlbums = [];
               
                lyricSnapshot.forEach(lyricRow => {
                    const { song_id, lyric_id } = lyricRow;

                    const song = songsSnapshot.find(songRow => songRow.song_id === song_id);
                    if (!song) return; // If song isn't found, skip

                    const album = albumSnapshot.find(albumRow => albumRow.album_id === song.album_id);
                    if (!album) return; // If album isn't found, skip

                    // Add objectId to song record
                    const songWithObjectId = {
                        ...song,
                        objectID: lyric_id
                    };

                    // Combine data
                    const songsWithLyricAndAlbums = {
                        song: songWithObjectId,
                        lyric: lyricRow,
                        album
                    };
                    songsWithLyricsAndAlbums.push(songsWithLyricAndAlbums);
                    // console.log('SONG ARRAY??', songsWithLyricsAndAlbums);
  
                    setSongs(songsWithLyricsAndAlbums);
                })

            } catch (error) {
                console.error('Failed to fetch and join lyric data: ', error);
            }
        }

        fetchData();

    }, []);


    useEffect(() => {
        const index = client.initIndex('song_lyrics');
        // console.log('SONGS: ', songs);

        const indexData = async () => {
            try {
                for (const song of songs) {
                    const { lyric_id, ...lyricData } = song.lyric;
                    const { ...songData } = song.song;
                    const { ...albumData } = song.album;

                // Combine all data into a single object
                    const dataToIndex = {
                        objectID: lyric_id,
                        ...lyricData, // Include lyric data
                        ...songData, // Include song data
                        ...albumData // Include album data
                    };

                    // Save song into Algolia using lyric_id as the objectID
                    await index.saveObject(dataToIndex);
                }
                console.log('Data indexed successfully');
            } catch (error) {
                console.error('Error indexing data: ', error);
            }
        };
    
        if (songs.length > 0) {
            // console.log('running indexData');
            indexData();
            
        }
    }, [songs, userId]);



  return null;
}
