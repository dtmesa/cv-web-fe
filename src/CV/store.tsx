import { configureStore } from '@reduxjs/toolkit';

import accountReducer from './Account/reducer';
import assignmentsReducer from './Courses/Assignments/reducer';
import modulesReducer from './Courses/Modules/reducer';
import questionsReducer from './Courses/Quizzes/Questions/reducer';
import quizzesReducer from './Courses/Quizzes/reducer';
import submissionsReducer from './Courses/Quizzes/Submissions/reducer';
import coursesReducer from './Courses/reducer';

const store = configureStore({
	reducer: {
		modulesReducer,
		accountReducer,
		assignmentsReducer,
		coursesReducer,
		quizzesReducer,
		questionsReducer,
		submissionsReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
