import React from 'react'
import { IndexData } from '../utilities/Algolia/IndexData'
import NavigationBar from '../components/NavigationBar'
import { Card } from 'react-bootstrap'
import Search from '../utilities/Algolia/Search'

export default function NewLyricSearch() {
  return (
    <>
        <IndexData />
        <NavigationBar />
        <Card>
            <h5>Search for lyrics</h5>
            <Card.Body>
                <Search />
            </Card.Body>
        </Card>
    </>
  )
}
