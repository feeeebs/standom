import { useCollection } from '@squidcloud/react';
import React, { useEffect, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar';
import { v4 as uuidv4 } from 'uuid';

export default function EditFavoriteLyric() {
    const location = useLocation();
    const { lyricObject } = location.state;
    const { favoriteId } = lyricObject;
    const navigate = useNavigate();

    const userFavoritesCollection = useCollection('users_favorite_lyrics', 'postgres_id');
    const lyricTagsCollection = useCollection('lyric_tags', 'postgres_id');
    const userTagsCollection = useCollection('user_lyric_tags', 'postgres_id');

    const [lyricTags, setLyricTags] = useState([]);
    const [selectedLyricTags, setSelectedLyricTags] = useState([])
    const [loading, setLoading] = useState(true);

    // set selected tags to the tags that are already associated with the favorite
    useEffect(() => {
        setSelectedLyricTags(lyricObject.tags.map(tag => ({ tagId: tag.tagId, tag: tag.tag })));
    }, []);
    
    // useEffect(() => {
    //     console.log('lyric tags: ', lyricTags);
    //     console.log('selected tags: ', selectedLyricTags);
    //     console.log('lyric object tags: ', lyricObject.tags);
    //     console.log('lyric object tag bool: ', lyricObject.tags.includes(lyricObject.tags[0]))
    // }, [lyricTags, selectedLyricTags]);

    // useEffect(() => {
    //     console.log('loading state: ', loading);
    // }, [loading]);

    // fetch lyric tags from DB
    useEffect(() => {
        const fetchTags = async () => {

            const lyricTagsSnapshot = await lyricTagsCollection
            .query()
            .dereference()
            .snapshot();
            console.log('lyric snap: ', lyricTagsSnapshot);
                
            const getTags = [];
            for (const tagRow of lyricTagsSnapshot) {
                const { tag_id, tag } = tagRow;
                const tagObject = {tagId: tag_id, tag: tag};
                getTags.push(tagObject);
            }
            
            setLyricTags(getTags);
            if (lyricObject) {
                setLoading(false);
            }

        }

        fetchTags();
    }, [])

    // track changes to checkboxes as user selects/deselects tags
    function handleCheckboxChange(e) {
        const { value, checked } = e.target;
        console.log('checked value: ', checked);
        if (checked) {
            const tagObject = lyricTags.find(tag => tag.tagId === parseInt(value));
            // Add the selected tag to the state
            setSelectedLyricTags(prevSelectedTags => [...prevSelectedTags, tagObject])
        } else {
            console.log('removing tag');
            // Remove deselected tag from the state
            setSelectedLyricTags(prevSelectedTags => prevSelectedTags.filter(tag => tag.tagId !== parseInt(value)))
        }
        console.log('selected tags: ', selectedLyricTags);
        console.log('value: ', value);
    }


    // function to clear out old tags associated with the favorite - used in handleSubmit and handleDelete
    const deleteOldTags = async () => {
        const oldTagsSnapshot = await userTagsCollection
            .query()
            .eq('favorite_id', favoriteId)
            .dereference()
            .snapshot();
        
        for (const tag of oldTagsSnapshot) {
            await userTagsCollection.doc({ user_lyric_tag_id: tag.user_lyric_tag_id }).delete()
                .then(() => console.log('Deleted tag'))
                .catch((error) => console.error('Error deleting tag: ', error));
        }
    }
    
    // handle form submission
    async function handleSubmit(e) {
        e.preventDefault()

        // function to add the new lyric tag list to the DB
        const addNewTags = async () => {
            
            for (const tag of selectedLyricTags) {
                const userLyricTagId = uuidv4();

                console.log('userLyricTagId: ', userLyricTagId);
                console.log('tag_id: ', parseInt(tag.tagId));
                console.log('favorite_id: ', favoriteId);

                // THIS IS ADDING ANY NEW CHECKS -- NEED TO ACCOUNT FOR REMOVALS
                await userTagsCollection.doc({ user_lyric_tag_id: userLyricTagId })
                    .insert({
                        user_lyric_tag_id: userLyricTagId,
                        favorite_id: favoriteId,
                        tag_id: parseInt(tag.tagId),
                    })
                    .then(() => console.log("Inserted tag"))
                    .catch((error) => console.error("Error inserting new tags into DB: ", error));
            }
        }

        // first delete all old tags; then add in the new tags
        await deleteOldTags();
        addNewTags();
        navigate("/dashboard")
    }    
    

    // handle favorite deletion
    const handleDelete = (favoriteId) => {
        console.log('favorite id being deleted: ', favoriteId);
          const deleteUserFavorite = async () => {
            // delete favorite from Db
            await userFavoritesCollection.doc({ favorite_id: favoriteId }).delete()
            .then(() => console.log('Deleted user favorite'))
            .catch((error) => console.error('Error deleting user favorite: ', error));
    
            // TO DO: also gotta delete tags but code below doesn't work
                // is the issue that there are multiple docs with the same favorite_id?
            // await userTagsCollection.doc({ favorite_id: favoriteId }).delete()
            //   .then(() => console.log('Deleted user favorite tags'))
            //   .catch((error) => console.error('Error deleting user favorite tags: ', error));
          }
          deleteUserFavorite();
          deleteOldTags();
          navigate('/dashboard');
      }


    if (loading) {
    return (
        <div>Loading...</div>
    )
    }

    return (
    <>
        <NavigationBar />
        <Card>
            <Card.Header><h4>Edit Favorite</h4></Card.Header>
            <Card.Body>
                <Card.Title>{lyricObject.songTitle}</Card.Title>
                    <Card.Subtitle>{lyricObject.albumTitle}</Card.Subtitle>
                    <Card.Text style={{ whiteSpace: 'pre-line' }}>
                        {lyricObject.lyric.lyric}
                    </Card.Text>
                    <h5>Why do you love it?</h5>
                    <Form>
                        {lyricTags.map((tag, index) => (
                            <Form.Check
                                key={index}
                                inline
                                label={tag.tag}
                                value={tag.tagId}
                                type='checkbox'
                                id={`inline-checkbox-${index}`}
                                onChange={handleCheckboxChange}
                                defaultChecked={lyricObject.tags.some(lyricTag => lyricTag.tagId === tag.tagId)}
                            />
                        ))}
                    </Form>

                    <div>
                    <Button onClick={handleSubmit}>Save Changes</Button>
                    </div>
                    
            </Card.Body>
        </Card>
        <Button variant='danger' onClick={() => handleDelete(favoriteId)}>Delete Favorite</Button>
    </>
  )
}
