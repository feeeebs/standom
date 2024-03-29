import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import QuizResults from './QuizResults';
import Quiz from './Quiz';

export default function QuizParent() {
    const quizStatus = useSelector(state => state.quiz.quizTaken);
    const [albumJourney, setAlbumJourney] = useState([]);
            // if the quiz has been taken already, display the results
    // TO DO -- can I make this happen before I do all the quiz stuff so I don't do that unnecessarily?
    if (quizStatus === true) {
        return <QuizResults albumJourney={albumJourney} setAlbumJourney={setAlbumJourney} />;
    } else {
        return <Quiz albumJourney={albumJourney} setAlbumJourney={setAlbumJourney} />;
    }
 
}
