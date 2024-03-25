import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form, Card } from 'react-bootstrap'
import { useCollection } from '@squidcloud/react';
import NavigationBar from '../components/NavigationBar';
import { v4 as uuidv4 } from 'uuid';

export default function AddNewLyrics({ userInfo }) {
    const userId = userInfo.id;
    const { lyricId } = useParams();
    const navigate = useNavigate();

    // DB references
    const albumCollection = useCollection('albums', 'postgres_id');
    const songCollection = useCollection('songs', 'postgres_id'); 
    const lyricCollection = useCollection('song_lyrics', 'postgres_id');
    const userFavoritesCollection = useCollection('users_favorite_lyrics', 'postgres_id');
    const lyricTagsCollection = useCollection('lyric_tags', 'postgres_id');
    const userTagsCollection = useCollection('user_lyric_tags', 'postgres_id');

    // Store lyric, song, album
    const [lyric, setLyric] = useState('');
    const [song, setSong] = useState('');
    const [album, setAlbum] = useState('');
    const [lyricTags, setLyricTags] = useState([]);
    const [selectedLyricTags, setSelectedLyricTags] = useState([]);

    useEffect(() => {
        const getData = async () => {
            try {
                // fetch lyric data
                const lyricSnapshot = await lyricCollection
                    .query()
                    .eq('lyric_id', parseInt(lyricId))
                    .dereference()
                    .snapshot();
                const { lyric, song_id } = lyricSnapshot[0];
                setLyric(lyric);
                
                // fetch song data
                const songSnapshot = await songCollection
                    .query()
                    .eq('song_id', song_id)
                    .dereference()
                    .snapshot();
                const { song_title, album_id } = songSnapshot[0];
                // console.log('SONG: ', song_title);
                setSong(song_title);

                // fetch album data
                const albumSnapshot = await albumCollection
                    .query()
                    .eq('album_id', album_id)
                    .dereference()
                    .snapshot();
                const album_title = albumSnapshot[0].album_title;
                // console.log('ALBUM: ', album_title);
                setAlbum(album_title);

                // fetch lyric tags
                const lyricTagsSnapshot = await lyricTagsCollection
                    .query()
                    .dereference()
                    .snapshot();
                //console.log('lyric tags: ', lyricTagsSnapshot);
                
                const getTags = [];
                lyricTagsSnapshot.forEach(tagRow => {
                    const { tag_id, tag } = tagRow;
                    const tagObject = {tagId: tag_id, tag: tag};
                    getTags.push(tagObject);
                });

                setLyricTags(getTags);

            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        }
        getData();
    }, []);

    function handleCheckboxChange(e) {
        const { value, checked } = e.target;
        console.log('checked value: ', checked);
        if (checked) {
            // Add the selected tag to the state
            setSelectedLyricTags(prevSelectedTags => [...prevSelectedTags, value])
        } else {
            // Remove deselected tag from the state
            setSelectedLyricTags(prevSelectedTags => prevSelectedTags.filter(tag => tag !== value))
        }
        console.log('selected tags: ', selectedLyricTags);
        console.log('value: ', value);
    }


    async function handleSubmit(e) {
        e.preventDefault()
        const insertNewFavorite = async () => {
            // generate unique id for favorite
            const favoriteId = uuidv4();

            // insert favorite into DB
            await userFavoritesCollection.doc({ favorite_id: favoriteId }).insert({
                favorite_id: favoriteId,
                user_id: userId,
                lyric_id: parseInt(lyricId)
            })
            .then(() => console.log('Inserted new user favorite'))
            .catch((error) => console.error('Error inserting new user favorite: ', error));

            // insert each lyric tag into DB
            for (const tag of selectedLyricTags) {
                const userLyricTagId = uuidv4();

                console.log('userLyricTagId: ', userLyricTagId);
                console.log('tag_id: ', parseInt(tag));
                console.log('favorite_id: ', favoriteId);

                await userTagsCollection.doc({ user_lyric_tag_id: userLyricTagId })
                    .insert({
                        user_lyric_tag_id: userLyricTagId,
                        tag_id: parseInt(tag),
                        favorite_id: favoriteId,
                    })
                    .then(() => console.log("Inserted tag"))
                    .catch((error) => console.error("Error inserting new tags into DB: ", error));
            }
        }

        insertNewFavorite();
        navigate("/dashboard")
    }    


    // old new lyrics form:
//     <Form onSubmit={handleSubmit}>
//     <h2 className='text-center mb-4'>Add a Lyric</h2>
//     {error && <Alert variant="danger">{error}</Alert>}

//     <Form.Group className='mb-3' id="favoriteLyrics">
//         <Form.Label><h5>Lyrics</h5></Form.Label>
//         <Form.Control 
//             as="textarea" 
//             value={lyric}
//             ref={favoriteLyricsRef}
//             placeholder="It's a love story, baby just say yes"
//         />
//     </Form.Group>
//     <Row>
//         <Col>
//             <Form.Group className='mb-3' controlId='lyricInputSongName'>
//                 <Form.Label><h5>Song</h5></Form.Label>
//                 <Form.Control 
//                     value={song}
//                     ref={favoriteSongRef}
//                     placeholder='Love Story'
//                     readOnly 
//                 />
//             </Form.Group>
//         </Col>
//         <Col>
//             <Form.Group className='mb-3' controlId='lyricInputAlbum'>
//                 <Form.Label><h5>Album</h5></Form.Label>
//                 <Form.Control 
//                     value={album}
//                     placeholder='Fearless'
//                     readOnly
//                 />
//             </Form.Group>
//         </Col>
//     </Row>
// </Form>

//                                checked={selectedLyricTags.includes(tag.tagId)}


    // TO DO: ADD ALBUM ART TO TOP OF CARD
    // TO DO: WHY YOU LOVE IT TAGS
  return (
    <>
        <NavigationBar />
        <Card>
            <Card.Header>New Lyric</Card.Header>
            <Card.Body>
                <Card.Title>{song}</Card.Title>
                    <Card.Subtitle>{album}</Card.Subtitle>
                    <Card.Text style={{ whiteSpace: 'pre-line' }}>
                        {lyric}
                    </Card.Text>
                    <h5>Why do you love it?</h5>
                        {lyricTags.map((tag, index) => (
                            <Form.Check
                                key={index}
                                inline
                                label={tag.tag}
                                value={tag.tagId}
                                type='checkbox'
                                id={`inline-checkbox-${index}`}
                                onChange={handleCheckboxChange}
                            />
                        ))}
                    <div>
                    <Button onClick={handleSubmit}>Add New Lyric</Button>
                    </div>
            </Card.Body>
        </Card>
    </>
  )
}
