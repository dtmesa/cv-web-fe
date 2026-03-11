import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

interface QuestionsState {
	questions: Question[];
}

const initialState: QuestionsState = {
	questions: [],
};

const questionsSlice = createSlice({
	name: 'questions',
	initialState,
	reducers: {
		setQuestions: (state, action: PayloadAction<Question[]>) => {
			state.questions = action.payload;
		},
		addQuestion: (state, action: PayloadAction<Omit<Question, 'id'>>) => {
			const newQuestion = {
				...action.payload,
				id: uuidv4(), //why is this on the frontend
				quiz: action.payload.quiz,
				title: action.payload.title,
				points: action.payload.points ?? 1,
				question: action.payload.question,
				question_type: action.payload.question_type ?? 'multiple_choice',
				order: action.payload.order,
				choices: action.payload.choices ?? [
					{ text: '', is_correct: false },
					{ text: '', is_correct: false },
					{ text: '', is_correct: false },
					{ text: '', is_correct: false },
				],
				correct_answer: action.payload.correct_answer,
				possible_answers: action.payload.possible_answers ?? [''],
				case_sensitive: action.payload.case_sensitive ?? false,
			};
			state.questions.push(newQuestion);
		},
		deleteQuestion: (state, action: PayloadAction<string>) => {
			state.questions = state.questions.filter((q) => q.id !== action.payload);
		},
		editQuestion: (
			state,
			action: PayloadAction<Partial<Question> & { id: string }>,
		) => {
			const updated = action.payload;
			state.questions = state.questions.map((q) =>
				q.id === updated.id ? { ...q, ...updated } : q,
			);
		},
	},
});

export const { addQuestion, deleteQuestion, editQuestion, setQuestions } =
	questionsSlice.actions;
export default questionsSlice.reducer;
