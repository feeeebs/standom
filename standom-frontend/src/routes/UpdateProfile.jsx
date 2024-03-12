import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCollection } from '@squidcloud/react';
import { useDispatch } from 'react-redux';
import { updateAll } from '../utilities/Redux/userSlice';
import NavigationBar from '../components/NavigationBar';


export default function UpdateProfile({ userInfo }) {

    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);
    const usersCollection = useCollection('users', 'postgres_id'); // Reference to users collection in DB
    const dispatch = useDispatch();
    // //const navigate = useNavigate()


    // Set default form data
    const [formData, setFormData] = useState({
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
    });
    console.log('formData: ', formData);
    
    
    // Function to update data
    const updateData = async () => {
        console.log("Running updateData");
        console.log("Form data being inserted: ", formData);
        await usersCollection.doc({ id: formData.id }).insert({
            //id: formData.id,
            name: formData.name,
            email: formData.email,
        })
            .then(() => console.log("User data updated successfully"))
            .catch((err) => console.error("Error inserting user data: ", err));
        console.log("finished DB update");
    };


    // Track form inputs
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        console.log("Form data: ", formData);
    }    


    // Handle form submissions
    const handleSubmit = async (e) => {
        e.preventDefault();
        // TO DO - validation for email and password
        console.log("handleFormSubmit running");
        await updateData(); // Update Squid DB
        dispatch(updateAll(formData))
        console.log("Check to see if it did anything");
        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Passwords do not match')
        }

        setLoading(true);
        setError('');

        // Update email
        // if (emailRef.current.value !== currentUser.email) {

        // }

        // TO DO: update with auth0 user data references
        // TO DO: update writing to new DB
        // if (emailRef.current.value !== currentUser.email) {
        //   promises.push(updateUserEmail(currentUser, emailRef.current.value))
        // }

        // if (passwordRef.current.value) {
        //   promises.push(updateUserPassword(currentUser, passwordRef.current.value))
        // }

        // Promise.all(promises).then(() => {
        //   // All promises resolved successfully
        //   navigate('/')
        // }).catch((error) => {
        //   // At least one promise rejected
        //   console.error('Error updating email:', error)
        //   setError('Failed to update account')
        // }).finally(() => {
        //   // Runs regardless
        //   setLoading(false)
        // })
            
    }


  return (
   <>
   <NavigationBar />
    <Card>
        <Card.Body>
            <h2 className='text-center mb-4'>Update Profile</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group id='name'>
                    <Form.Label>Name</Form.Label>
                    <Form.Control 
                        name='name'
                        type='text'
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group id="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control 
                        name='email'
                        type="email" 
                        ref={emailRef} 
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group id="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                        type="password" 
                        ref={passwordRef} 
                        placeholder='Leave blank to keep the same' 
                    />
                </Form.Group>
                <Form.Group id="password-confirm">
                    <Form.Label>Password Confirmation</Form.Label>
                    <Form.Control 
                        type="password" 
                        ref={passwordConfirmRef} 
                        placeholder='Leave blank to keep the same' 
                    />
                </Form.Group>
                <Button disabled={loading} className='w-100 mt-4' type="submit">Update Profile</Button>
            </Form>
        </Card.Body>
    </Card>
    <div className='w-100 text-center mt-2'>
        <Link to="/profile">Cancel</Link>
    </div>

   </>
  )
}
