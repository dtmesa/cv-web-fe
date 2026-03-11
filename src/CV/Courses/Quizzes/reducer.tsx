import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

interface QuizzesState {
	quizzes: Quiz[];
}

const initialState: QuizzesState = {
	quizzes: [],
};

const quizzesSlice = createSlice({
	name: 'quizzes',
	initialState,
	reducers: {
		setQuizzes: (state, action: PayloadAction<Quiz[]>) => {
			state.quizzes = action.payload;
		},
		addQuiz: (state, action: PayloadAction<Omit<Quiz, 'id'>>) => {
			const quiz = action.payload;
			const newQuiz: Quiz = {
				id: uuidv4(),
				...quiz,
			};
			state.quizzes.push(newQuiz);
		},
		deleteQuiz: (state, action: PayloadAction<string>) => {
			const quizId = action.payload;
			state.quizzes = state.quizzes.filter((q) => q.id !== quizId);
		},
		editQuiz: (state, action: PayloadAction<Quiz>) => {
			const updatedQuiz = action.payload;
			state.quizzes = state.quizzes.map((q) =>
				q.id === updatedQuiz.id ? { ...q, ...updatedQuiz } : q,
			);
		},
	},
});

export const { addQuiz, deleteQuiz, editQuiz, setQuizzes } =
	quizzesSlice.actions;
export default quizzesSlice.reducer;
