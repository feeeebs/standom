import { executable, SquidService } from "@squidcloud/backend";

export class QuizService extends SquidService {
    
    @executable()
    getQuiz(quizCollection, answerCollection) {
        // query database
        const quizQuery = quizCollection.query()
        const answerQuery = answerCollection.query()
        // put questions and answers into a dictionary

    }


    //
}