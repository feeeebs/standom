import React, { useEffect, useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import { useCollection } from '@squidcloud/react';
import QuizResults from './QuizResults';
import { useDispatch, useSelector } from 'react-redux';
import { setFinalQuiz, setQuestions, setFirstQuestion, updateQuizTaken, updateUserAnswers } from '../utilities/Redux/quizSlice';
import { v4 as uuidv4 } from 'uuid';


export default function Quiz() {

    // State to manage user answers and quiz questions
    const userId = useSelector(state => state.user.userInfo.id);

    const [loading, setLoading] = useState(true);
    const [disableButton, setDisableButton] = useState(true);
    const [totalScore, setTotalScore] = useState([]); 
    
    const questionCollection = useCollection('quiz_questions', 'postgres_id'); // DB reference to quiz questions
    const answerCollection = useCollection('quiz_answers', 'postgres_id'); // DB reference to quiz answers
    const userQuizCollection = useCollection('user_quizzes', 'postgres_id'); // DB reference to user quizzes
    const quizScoringCollection = useCollection('quiz_scoring', 'postgres_id'); // DB reference to quiz scores

    const createQuiz = []; // Just used to store quiz as it's being collected from the DB

    const dispatch = useDispatch();
    const quizStatus = useSelector(state => state.quiz.quizTaken);
    const currentQuestion = useSelector(state => state.quizQuestions.question);
    const questionIndex = useSelector(state => state.quizQuestions.currentIndex);

    const userAnswers = useSelector(state => state.quiz.userAnswers);

    useEffect(() => {
        console.log('total score: ', totalScore);
    }, [totalScore]);

    useEffect(() => {
        const getQuiz = async () => {
            try {
                const questionSnapshot = await questionCollection.query().snapshot();
                questionSnapshot.forEach(questionRow => {
                    const { question_id, question } = questionRow.data;
                    //console.log('running question snapshot for loop for: ', question);
                    createQuiz[question_id] = { question: {question_id: question_id, question: question}, answers: [] };
                });
                const answerSnapshot = await answerCollection.query().snapshot();
                //console.log('number of rows in answerSnapshot: ', answerSnapshot.length);
                answerSnapshot.forEach((answerRow) => {
                    //console.log('loop iteration: ', `${index + 1}`)
                    const { answer_id, question_id, answer } = answerRow.data;
                    //console.log("running answer snapshot for loop for: ", answer);
                    // Check if the answer_id already exists in the answers array
                    // TODO: Fix this hacky solution because it's inefficient, but we don't really care b/c n
                    //       doesn't get very big.
                    const existingAnswer = createQuiz[question_id].answers.find(ans => ans.answer_id === answer_id);

                    // If the answer_id doesn't exist, push the new answer
                    if (!existingAnswer) {
                        const answerObject = { answer_id, answer };
                        createQuiz[question_id].answers.push(answerObject);
                    }
                })
                // Store final quiz in redux
                dispatch(setFinalQuiz(createQuiz));


                //console.log('about to set questions: ', finalQuiz[questionIndex]);
                //console.log('questionIndex: ', questionIndex);


                //console.log('fullQuiz: ', finalQuiz);
                //console.log("length of fullQuiz: ", Object.keys(finalQuiz).length);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };

        getQuiz();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // Set up final quiz and first question
    const finalQuiz = useSelector(state => state.quiz.finalQuiz)
    dispatch(setFirstQuestion(finalQuiz[questionIndex]));


    // Get quiz length to track progress through quiz
    const quizLength = Object.keys(finalQuiz).length;
    

    // if the quiz has been taken already, display the results
    // TO DO -- can I make this happen before I do all the quiz stuff so I don't do that unnecessarily?
    if (quizStatus === true) {
        return <QuizResults />;
    }


    // Save current selection to userAnswers on button click
    function handleButtonClick(event) {
        event.preventDefault();
        // save user choice to userAnswers state
        const selectedAnswerId = event.currentTarget.id;
        console.log("answer id: ", selectedAnswerId);
        dispatch(updateUserAnswers({ [questionIndex]: selectedAnswerId }));
        // enable submit button
        setDisableButton(false);
    }

    // Function to insert quiz data into Postgres 
    const insertUserAnswersToDb = async () => {
        console.log('inserting quizAnswers: ', userAnswers);
        const userQuizlog = await userQuizCollection.query().dereference().snapshot();
        console.log('results: ', userQuizlog);

        // TO DO - add the timestamp back into the DB insert once the squid schema updates
        //const currentDate = new Date(); // Get current date/time
        //const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' '); // Format date/time as YYYY-MM-DD HH:MM:SS

        for (const questionId in userAnswers) {
            const answerId = parseInt(userAnswers[questionId]);
            const userAnswerId = uuidv4();

            console.log('user_answer_id: ', userAnswerId);
            console.log('user_id: ', userId);
            console.log('question_id: ', parseInt(questionId));
            console.log('answer_id: ', answerId);
            //console.log('timestamp: ', formattedDate);



            await userQuizCollection.doc({ user_answer_id: userAnswerId }).insert({
                user_answer_id: userAnswerId,
                user_id: userId,
                question_id: parseInt(questionId),
                answer_id: answerId,
                //timestamp: formattedDate,
            }).then(() => console.log("Answers inserted into DB successfully"))
            .catch((err) => console.error("Error inserting user answers into DB: ", err));
        }
      }
    

    // Handle user answers on answer submission
    async function handleSubmit(event) {
        event.preventDefault();

        // Calculate the index of the next question
        const newIndex = questionIndex + 1;
        
        // check if quiz is completed
        if (newIndex === quizLength) {
            // Update quiz status in Redux
            dispatch(updateQuizTaken(true));
            
            // Write user answers to DB
            insertUserAnswersToDb();

            // take the scoreObject and order it by scores, biggest to smallest
            // display the albums in that order
        } else {
            // Get the answer's scores from the quiz_scoring table
            const getScores = async () => {
                const answerId = parseInt(userAnswers[questionIndex]);
                console.log('getting snapshot for answer_id: ', answerId);
                console.log('getting snapshot for question_id: ', finalQuiz[questionIndex].question.question_id);
                const scoreSnapshot = await quizScoringCollection
                    .query()
                    .eq('answer_id', answerId)
                    .eq('question_id', finalQuiz[questionIndex].question.question_id)
                    .dereference()
                    .snapshot();
                
                console.log('scoreSnapshot: ', scoreSnapshot);
                scoreSnapshot.forEach(scoreRow => {
                    const { album_id, score } = scoreRow;
                    console.log('album_id: ', album_id);
                    console.log('score: ', score);
                    // TO DO - add the score to the user's score object
                    // TO DO - add the score to the total score object

                    // Add the score to the total score state
                    setTotalScore(prevTotalScore => ({
                        ...prevTotalScore, 
                        [album_id]: (prevTotalScore[album_id] || 0) + score
                    }));
                });
            }
            await getScores();

            // Get the next question from fullQuiz
            console.log('setting next question: ', finalQuiz[newIndex])
            console.log('fullquiz after submit: ', finalQuiz)
            const nextQuestion = finalQuiz[newIndex];
            dispatch(setQuestions({ newIndex, nextQuestion }))
            setDisableButton(true);
        }
    }

    // Get score of answer and add it to the user's score object
    // scoreObject = [{album_id: 1, score: 0}, {album_id: 2, score: 0}, {album_id: 3, score: 0}, etc]
    // STEPS
        // take the question_id and answer_id from the user answer; 
        // look up the score in the quiz_scoring table
        // for each row, add the score value to the related album_id in the scoreObject


    return (
        <Card>
            <Card.Body>
                <h2 className='text-center mb-4'>Start your Swiftie journey</h2>
                    <div>
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            currentQuestion && currentQuestion.answers && (
                                <div className='list-group'>
                                    <h5>{currentQuestion.question.question}</h5>
                                    <Form onSubmit={handleSubmit}>
                                        {currentQuestion.answers.map((answer, answerIndex) => (
                                            <div key={answerIndex}>
                                                <button 
                                                    type='button'
                                                    className='list-group-item list-group-item-action'
                                                    id={answer.answer_id}
                                                    onClick={handleButtonClick}
                                                >{answer.answer}</button>
                                            </div>
                                        ))}
                                        <button className='btn btn-primary wt-100 mt-4' disabled={disableButton}>Submit</button>
                                    </Form>
                                </div>
                            )
                        )}
                        
                    </div>
            </Card.Body>
        </Card>
    )
}
