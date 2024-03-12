import { useEffect, useState } from 'react';
import client from './algoliaConfig';
import { useCollection } from '@squidcloud/react';

export function IndexData() {
    const [songs, setSongs] = useState([]);
    const lyricCollection = useCollection('song_lyrics', 'postgres_id');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const lyricSnapshot = await lyricCollection.query().snapshot();
                console.log('lyricSnapshot: ', lyricSnapshot);
                const lyricData = [];
                lyricSnapshot.forEach (lyricRow => {
                    const { lyric_id, lyric } = lyricRow.data;
                    const lyricObject = {lyric_id: lyric_id, lyric: lyric };
                    lyricData.push(lyricObject);
                    //lyricData.push(lyricRow.data.lyric);
                });

                setSongs(lyricData);

                console.log('Songs array: ', lyricData);
            } catch (error) {
                console.error('Error fetching lyrics from database: ', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const index = client.initIndex('song_lyrics');

        const indexData = async () => {
            try {
                await index.saveObjects(songs, {
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