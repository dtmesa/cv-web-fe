import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

interface CoursesState {
	courses: Course[];
	enrollments: Enrollment[];
}

const initialState: CoursesState = {
	courses: [],
	enrollments: [],
};

const coursesSlice = createSlice({
	name: 'courses',
	initialState,
	reducers: {
		addCourse: (state, action: PayloadAction<Omit<Course, 'id'>>) => {
			const newCourse: Course = { ...action.payload, id: uuidv4() };
			state.courses.push(newCourse);
		},
		deleteCourse: (state, action: PayloadAction<string>) => {
			state.courses = state.courses.filter((c) => c.id !== action.payload);
		},
		updateCourse: (state, action: PayloadAction<Course>) => {
			const index = state.courses.findIndex((c) => c.id === action.payload.id);
			if (index !== -1) {
				state.courses[index] = action.payload;
			}
		},
		setEnrollments: (state, action: PayloadAction<Enrollment[]>) => {
			state.enrollments = action.payload;
		},
		enroll: (state, action: PayloadAction<Enrollment>) => {
			const exists = state.enrollments.some(
				(e) =>
					e.user === action.payload.user && e.course === action.payload.course,
			);
			if (!exists) {
				state.enrollments.push(action.payload);
			}
		},
		unenroll: (
			state,
			action: PayloadAction<{ user: string; course: string }>,
		) => {
			state.enrollments = state.enrollments.filter(
				(e) =>
					!(
						e.user === action.payload.user && e.course === action.payload.course
					),
			);
		},
	},
});

export const {
	addCourse,
	deleteCourse,
	updateCourse,
	enroll,
	unenroll,
	setEnrollments,
} = coursesSlice.actions;
export default coursesSlice.reducer;
