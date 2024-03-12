import React from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function Results() {
  /* Function to calculate the recommended listening order based on answers
  const calculateOrder = () => {
    // implement logic
    const orderedAlbums = userAnswers
    return orderedAlbums 
  }

  */

  return (
    <>
        <Card>
            <Card.Body>
                <h2 className='text-center mb-4'>Results!</h2>
                    <div>
                        Here are your results :) :) :)
                    </div>
                    <div>
                        Want to retake the quiz? <Link to="/">Click here</Link>
                    </div>
            </Card.Body>
        </Card>
    </>
  )
}
