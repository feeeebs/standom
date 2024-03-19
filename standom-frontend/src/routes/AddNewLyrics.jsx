import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Form, Col, Row, Card } from 'react-bootstrap'
import { useCollection } from '@squidcloud/react';
import { useDispatch, useSelector } from 'react-redux';
import { addAlbum } from '../utilities/Redux/albumSlice';
import NavigationBar from '../components/NavigationBar';
import Search from '../utilities/Algolia/Search';
import { IndexData } from '../utilities/Algolia/IndexData';


// TO DO -- add disabled logic to Submit button
// TO DO -- make it so song only fills in once there is a real match -- maybe buttons with song snippets?
// TO DO -- save the "why you love it" tags

export default function AddNewLyrics() {
    // USER SELECTS ALBUM AND/OR SONG
    // USER CAN PICK FROM LIST OF LYRICS
    // ON SUBMISSION, SAVES LYRIC ID TO USERS_FAVORITE_LYRICS DB


/////////// OLD STUFF //////////////////////
    const [error, setError] = useState()
    const [songs, setSongs] = useState()
    const [selectedSong, setSelectedSong] = useState({ title: '', album: '', lyrics: ''})
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const favoriteLyricsRef = useRef()
    const favoriteSongRef = useRef()
////////////////////////////////////////////
    
    const dispatch = useDispatch();
    const albums = useSelector(state => state.albums.albumList);

    const albumCollection = useCollection('albums', 'postgres_id');
    const songCollection = useCollection('songs', 'postgres_id'); 
    const lyricCollection = useCollection('song_lyrics', 'postgres_id'); // DB reference to song lyric snippets

    // Get full list of albums from DB
    useEffect(() => {
        const getAlbums = async () => {
            try {
                const createAlbumList = [];
                const albumSnapshot = await albumCollection.query().snapshot();
                albumSnapshot.forEach(albumRow => {
                    const { album_id, album_title } = albumRow.data;
                    const albumObject = { album_id: album_id, album_title: album_title };
                    createAlbumList.push(albumObject);
                })
                
                dispatch(addAlbum(createAlbumList));
            } catch (error) {
                console.error('Error fetching albums: ', error);
            }
        };
        getAlbums();
    
    }, []);
    
    // const lyricSnapshot = await lyricCollection.query().snapshot();
    // lyricSnapshot.forEach((snapshotRow) => {
    //     const { lyric_id, song_id, lyric } = snapshotRow.data;
    // })
    

    const navigate = useNavigate();

    // TO DO: Update how you write lyric data to postgres
    // function writeUserData(userId, song, lyrics) {
    //     push(ref(database, 'users/' + userId + '/favorites'), {
    //         favorite_song: song,
    //         favorite_lyrics: lyrics
    //     })
    // }

    async function handleSubmit(e) {
        e.preventDefault()

        if (!favoriteSongRef.current.value || !favoriteLyricsRef.current.value) {
             return setError('Fill in lyrics and song title')
        }
        // TO DO: update writeUserData function with new one
        // writeUserData(currentUser.uid, favoriteSongRef.current.value, favoriteLyricsRef.current.value)
        navigate("/dashboard")
  
    }    

    function handleAlbumSelect(e) {
        e.preventDefault();
        console.log(e.currentTarget.value);
    }


    // TO DO: Redo with references to new DB
    // const searchDatabase = async () => {
    //     try {
    //         const snapshot = await get(songsRef)
    //         const allSongs = snapshot.val()

    //         // Filter songs based on the search query
    //         const filteredSongs = allSongs.filter((song) =>
    //         song.lyrics.toLowerCase().includes(searchQuery.toLowerCase())
    //         )

    //         setSearchResults(filteredSongs)

    //         // Auto-select the first song from the search results or to empty values
    //         if (filteredSongs.length > 0) {
    //             setSelectedSong(filteredSongs[0])
    //         } else {
    //             setSelectedSong({ title: '', album: '', lyrics: ''})
    //         }
    //     } catch(error) {
    //         console.error('Error searching database:', error)
    //     }
    // }

    // useEffect(() => {
    //     searchDatabase();
    // }, [searchQuery])
    
    // TO DO -- ADD <SEARCH /> BACK IN WHEN I FIGURE OUT HOW IT WORKS!
    //        <IndexData />
  return (
    <>
        <IndexData />
        <NavigationBar />
        <div>
            <Search />
        </div>
        <Card>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    <h2 className='text-center mb-4'>Add a Lyric</h2>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <div className='mb-3'>
                        <Form.Select onClick={handleAlbumSelect}>
                            {albums.map((album, index) => (
                                <option key={index} value={album.album_id}>{album.album_title}</option>
                            ))}
                        </Form.Select>
                    </div>

                    <Form.Group className='mb-3' id="favoriteLyrics">
                        <Form.Label><h5>Lyrics</h5></Form.Label>
                        <Form.Control 
                            as="textarea" 
                            value={searchQuery}
                            ref={favoriteLyricsRef}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="It's a love story, baby just say yes"
                        />
                    </Form.Group>
                    <Row>
                        <Col>
                            <Form.Group className='mb-3' controlId='lyricInputSongName'>
                                <Form.Label><h5>Song</h5></Form.Label>
                                <Form.Control 
                                    value={searchResults.length > 0 && searchQuery !== '' ? selectedSong.title : ''}
                                    ref={favoriteSongRef}
                                    placeholder='Love Story'
                                    readOnly 
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className='mb-3' controlId='lyricInputAlbum'>
                                <Form.Label><h5>Album</h5></Form.Label>
                                <Form.Control 
                                    value={searchResults.length > 0 && searchQuery !== '' ? selectedSong.album : ''}
                                    placeholder='Fearless'
                                    readOnly
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <h5>Why do you love it?</h5>
                    {['checkbox'].map((type) => (
                        <div key={`inline-${type}`} className='mb-3'>
                            <Form.Check
                                inline
                                label="Love"
                                name='love'
                                type={type}
                                id={`inline-${type}-1`}
                            />
                            <Form.Check
                                inline
                                label="Heartbreak"
                                name='heartbreak'
                                type={type}
                                id={`inline-${type}-1`}
                            />
                            <Form.Check
                                inline
                                label="Catharsis"
                                name='catharsis'
                                type={type}
                                id={`inline-${type}-1`}
                            />
                            <Form.Check
                                inline
                                label="Nostalgia"
                                name='nostalgia'
                                type={type}
                                id={`inline-${type}-1`}
                            />
                        </div>
                    ))}
                    <Button className='w-100 mt-4' type="submit">Add Lyrics</Button>
                </Form>
            </Card.Body>
        </Card>
    </>
  )
}
