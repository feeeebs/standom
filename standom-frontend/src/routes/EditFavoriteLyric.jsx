import { useCollection } from '@squidcloud/react';
import React, { useEffect, useState } from 'react'
import { Button, Card } from 'react-bootstrap';
import { Form, useLocation, useNavigate, useParams } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar';

export default function EditFavoriteLyric() {
    const { favoriteId } = useParams();
    const location = useLocation();
    const { lyricObject } = location.state;
    const navigate = useNavigate();

    const favoritesCollection = useCollection('users_favorite_lyrics', 'postgres_id');
    const lyricTagsCollection = useCollection('lyric_tags', 'postgres_id');

    const [lyricTags, setLyricTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('lyric tags: ', lyricTags);
    }, [lyricTags]);

    useEffect(() => {
        console.log('loading state: ', loading);
    }, [loading]);

    useEffect(() => {
        const getTags = async () => {
            // fetch lyric tags
            const lyricTagsSnapshot = await lyricTagsCollection
            .query()
            .dereference()
            .snapshot();
            console.log('lyric tags: ', lyricTagsSnapshot);
                
            const getTags = [];
            lyricTagsSnapshot.forEach(tagRow => {
                const { tag_id, tag } = tagRow;
                const tagObject = {tagId: tag_id, tag: tag};
                getTags.push(tagObject);
            });

            setLyricTags(getTags);
            setLoading(false);
        }

        getTags();
    }, [])

    // handle favorite deletion
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
          navigate('/dashboard');
      }



// for tags:
// get tags from DB
// if tag_id is in lyricObjects.tagId then checked
  

// {lyricTags.map((tag, index) => (
//     <Form.Check
//         key={index}
//         inline
//         label={tag.tag}
//         value={tag.tagId}
//         type='checkbox'
//         id={`inline-checkbox-${index}`}
//     />
// ))}

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
                        {lyricObject.lyric}
                    </Card.Text>
                    <h5>Why do you love it?</h5>
                    {/* <div>
                        {lyricTags.map((tag, index) => (
                            <Form.Check
                                key={index}
                                inline
                                label={tag.tag}
                                value={tag.tagId}
                                type='checkbox'
                                id={`inline-checkbox-${index}`}
                            />
                        ))}
                    </div> */}
                    <div>
                    <Button>Save Changes</Button>
                    </div>
                    
            </Card.Body>
        </Card>
        <Button variant='danger' onClick={() => handleDelete(favoriteId)}>Delete Favorite</Button>
    </>
  )
}
