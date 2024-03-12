import { createSlice } from '@reduxjs/toolkit'

export const quizSlice = createSlice({
    name: 'quiz',
    initialState: {
        finalQuiz: [],
        quizTaken: false,
        userAnswers: {}
    },
    reducers: {
        setFinalQuiz: (state, action) => {
            state.finalQuiz = action.payload;
        },
        updateQuizTaken: (state) => {
            state.quizTaken = !state.quizTaken;
        },
        updateUserAnswers: (state, action) => {
            state.userAnswers = {...state.userAnswers, ...action.payload};
        }
    }
});

export const quizQuestionsSlice = createSlice({
    name: 'quizQuestions',
    initialState: {
        question: null,
        currentIndex: 0 // Initial question index
    },
    reducers: {
        setFirstQuestion: (state, action) => {
            state.question = action.payload;
        },
        setQuestions: (state, action) => {
            state.question = action.payload.nextQuestion;
            state.currentIndex = action.payload.newIndex;
        },
    }
});


export default quizSlice.reducer;
export const { setFinalQuiz, updateQuizTaken, updateUserAnswers } = quizSlice.actions;

export const quizQuestionsReducer = quizQuestionsSlice.reducer;
export const { setQuestions, setFirstQuestion } = quizQuestionsSlice.actions;

