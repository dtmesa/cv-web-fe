import { createSlice } from '@reduxjs/toolkit';

interface UserState {
	currentUser: User | null;
}

const initialState: UserState = {
	currentUser: null,
};

const accountSlice = createSlice({
	name: 'account',
	initialState,
	reducers: {
		setCurrentUser: (state, action) => {
			state.currentUser = action.payload;
		},
	},
});

export const { setCurrentUser } = accountSlice.actions;
export default accountSlice.reducer;
