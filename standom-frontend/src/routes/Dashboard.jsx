import React from 'react';
import { Container, Row } from 'react-bootstrap';
import Quiz from '../components/Quiz';
import MyFavoriteLyrics from '../components/MyFavoriteLyrics';
import NavigationBar from '../components/NavigationBar';

export default function Dashboard({ userInfo }) {

    if (!userInfo) {
        return <div>Loading...</div>;
    }
    
    
  return (
    <>
        <NavigationBar />
        <div className='text-center mb-4'>
            <h1>Welcome, {userInfo.firstName}!</h1>
        </div>
        <Container>
            <Row>
                <Quiz />
            </Row>
            <Row>
                <MyFavoriteLyrics />
            </Row>
        </Container>
    </>
  )
}
