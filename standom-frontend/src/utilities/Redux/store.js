import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import quizReducer, { quizQuestionsReducer} from './quizSlice'
import lyricsReducer from './lyricsSlice'
import albumReducer from './albumSlice'

export default configureStore({
    reducer: {
        user: userReducer,
        quiz: quizReducer,
        quizQuestions: quizQuestionsReducer,
        lyrics: lyricsReducer,
        albums: albumReducer,
        //favoriteSongs: favoriteSongsReducer,
        //quizAnswers: quizAnswersReducer
    }
})
