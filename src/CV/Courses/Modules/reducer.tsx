import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

interface ModulesState {
	modules: CVModule[];
}

const initialState: ModulesState = {
	modules: [],
};

const modulesSlice = createSlice({
	name: 'modules',
	initialState,
	reducers: {
		setModules: (state, action: PayloadAction<CVModule[]>) => {
			state.modules = action.payload;
		},
		addModule: (
			state,
			action: PayloadAction<{ name: string; course: string }>,
		) => {
			const newModule: CVModule = {
				id: uuidv4(),
				name: action.payload.name,
				course: action.payload.course,
				lessons: [],
				description: '',
			};
			state.modules.push(newModule);
		},
		deleteModule: (state, action: PayloadAction<string>) => {
			state.modules = state.modules.filter((m) => m.id !== action.payload);
		},
		updateModule: (state, action: PayloadAction<CVModule>) => {
			state.modules = state.modules.map((m) =>
				m.id === action.payload.id ? action.payload : m,
			);
		},
		editModule: (state, action: PayloadAction<string>) => {
			state.modules = state.modules.map((m) =>
				m.id === action.payload ? { ...m, editing: true } : m,
			);
		},
	},
});

export const { addModule, deleteModule, updateModule, editModule, setModules } =
	modulesSlice.actions;

export default modulesSlice.reducer;
