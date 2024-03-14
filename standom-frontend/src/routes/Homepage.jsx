import React, { useEffect } from 'react'
import LoginButton from '../components/Login'
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom';

export default function Homepage() {

  const { user } = useAuth0();
  const navigate = useNavigate();
  console.log(user);
  // Redirect to dashboard if user is authenticated
  useEffect(() => {
    if (user) {
      // think about having a loading page so it's not so uggo while auth0 checks authentication
      navigate('/dashboard');
    }
  }, [user]);
  
  return (
    <>
      <Container fluid>
        <Row className='text-center'>
          <Col>
            <div>
              <h1>Standom</h1>
            </div>
            <div>
              <h3>Where every day is The Best Day</h3>
            </div>
            <div>
              <Form>
                <LoginButton />
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}
