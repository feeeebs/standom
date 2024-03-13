import React from 'react'
import { Container, Col, Form, Nav, Navbar, Row } from 'react-bootstrap'
import LogoutButton from './Logout'
import { Link } from 'react-router-dom'

export default function NavigationBar() {

  return (
    <Container className='mb-3'>
        <Navbar expand="lg" className='bg-body-tertiary'>
            <Navbar.Brand href='/dashboard'>Standom</Navbar.Brand>
                <Navbar.Toggle aria-controls='basic-navbar-nav' />
                    <Navbar.Collapse id='basic-navbar-nav'>
                        <Nav className='me-auto'>
                            <Nav.Link as={Link} to='/dashboard' className='mr-3'>Home</Nav.Link>
                            <Nav.Link as={Link} to='/profile' className='mr-3'>Profile</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
            <Form inline="true">
                <Row>
                    <Col xs='auto'>
                        <LogoutButton />
                    </Col>
                </Row>
            </Form>
        </Navbar>
</Container>
  )
}
