import React from 'react';
import { Container, Row } from 'react-bootstrap';
import MyFavoriteLyrics from '../components/MyFavoriteLyrics';
import NavigationBar from '../components/NavigationBar';
import QuizParent from '../components/QuizParent';

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
                <QuizParent />
            </Row>
            <Row>
                <MyFavoriteLyrics />
            </Row>
        </Container>
    </>
  )
}
