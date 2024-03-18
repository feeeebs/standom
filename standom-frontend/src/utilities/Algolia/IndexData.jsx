import { useEffect, useState } from 'react';
import client from './algoliaConfig';
import { useCollection } from '@squidcloud/react';

export function IndexData() {
    const [songs, setSongs] = useState([]);
    const lyricCollection = useCollection('song_lyrics', 'postgres_id');
    const songsCollection = useCollection('songs', 'postgres_id');
    const albumsCollection = useCollection('albums', 'postgres_id');
    const albumData = [];

    useEffect(() => {
        // TO DO: join lyric data with song titles and albums
            // join lyric to song based on song_id
            // join song to album based on album_id


        const fetchData = async () => {
            try {
                // get all the albums
                let albumObject = {};
                const albumSnapshot = await albumsCollection.query().snapshot();
                console.log('albumSnapshot: ', albumSnapshot);
                // loop through each album and get the songs
                albumSnapshot.forEach(albumRow => {
                    const { album_id, album_title } = albumRow.data;
                    console.log('album id: ', album_id);
                    console.log('album title: ', album_title)

                    const albumQuery = albumsCollection
                        .query()
                        .eq('album_id', album_id);
                    console.log('albumQuery: ', albumQuery);

                    // join current album with songs table based on album id
                    const joinObjects = songsCollection
                        .joinQuery('song')
                        .join(albumQuery, 'album', {
                            left: 'album_id',
                            right: 'album_id'
                        })
                        .dereference()
                        .snapshot();
                        console.log('joinObjects: ', joinObjects);
                    

                    // TO DO:  once join is working add song_id, song_title to the albumObject; Do the same for lyrics to songs
                    albumObject = { album_id: album_title };
                    //albumObject = { album_id: album_title, song_id, song_title, lyric_id, lyric_title}
                    albumData.push(albumObject);
                })
            } catch (error) {
            console.error('Error joining album and song data: ', error);
            }
        }
        fetchData();

        // const fetchData = async () => {

        //             // for each album, get all the songs

        //                 // for each song, get all the lyrics
        //     try {
        //     const lyricSnapshot = await lyricCollection.query().snapshot();
        //     console.log('lyricSnapshot: ', lyricSnapshot);
        //     const lyricData = [];
        //     lyricSnapshot.forEach (lyricRow => {
        //         const { lyric_id, lyric } = lyricRow.data;
        //         const lyricObject = {lyric_id: lyric_id, lyric: lyric };
        //         lyricData.push(lyricObject);
        //         //lyricData.push(lyricRow.data.lyric);
        //     });

        //     setSongs(lyricData);

        //     console.log('Songs array: ', lyricData);
        // } catch (error) {
        //     console.error('Error fetching lyrics from database: ', error);
        // }


        // fetchData();
    }, [albumsCollection]);

    useEffect(() => {
        const index = client.initIndex('song_lyrics');

        const indexData = async () => {
            try {
                await index.saveObjects(albumData, {
                    autoGenerateObjectIDIfNotExist: true,
                });

                console.log('Data indexed successfully');
            } catch (error) {
                console.error('Error indexing data: ', error);
            }
        };
    
    if (songs.length > 0) {
        indexData();
    }
    
    }, [songs]);


  return null;
}




// 1. Import algoliaClient
// 2. Define song_lyrics collection
// 3. Define indexData function
// 3. Get all song lyrics from postgres
// 4. Save song lyrics from postgres into songs array
// 5. Initialize Algolia Index
// 6. Save objects to Algolia Index
// 7. Log success
// 8. Execute indexData