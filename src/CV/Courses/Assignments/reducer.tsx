import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

interface AssignmentsState {
	assignments: Assignment[];
}

const initialState: AssignmentsState = {
	assignments: [],
};

const assignmentsSlice = createSlice({
	name: 'assignments',
	initialState,
	reducers: {
		setAssignments: (state, action: PayloadAction<Assignment[]>) => {
			state.assignments = action.payload;
		},

		addAssignment: (state, action: PayloadAction<Omit<Assignment, 'id'>>) => {
			const assignment = action.payload;

			const newAssignment: Assignment = {
				id: uuidv4(),
				...assignment,
			};

			state.assignments.push(newAssignment);
		},

		deleteAssignment: (state, action: PayloadAction<string>) => {
			state.assignments = state.assignments.filter(
				(a) => a.id !== action.payload,
			);
		},

		editAssignment: (state, action: PayloadAction<Assignment>) => {
			const updatedAssignment = action.payload;

			state.assignments = state.assignments.map((a) =>
				a.id === updatedAssignment.id ? updatedAssignment : a,
			);
		},
	},
});

export const {
	addAssignment,
	deleteAssignment,
	editAssignment,
	setAssignments,
} = assignmentsSlice.actions;

export default assignmentsSlice.reducer;
