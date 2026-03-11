import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

interface SubmissionsState {
	submissions: Submission[];
}

const initialState: SubmissionsState = {
	submissions: [],
};

const submissionsSlice = createSlice({
	name: 'submissions',
	initialState,
	reducers: {
		setSubmissions: (state, action) => {
			state.submissions = action.payload;
		},
		addSubmission: (state, { payload: submission }) => {
			const newSubmission = {
				id: uuidv4(),
				quiz: submission.quiz,
				user: submission.user,
				attempt_number: submission.attempt_number || 1,
				status: submission.status || 'in_progress',
				total_score: submission.total_score || 0,
				max_possible_score: submission.max_possible_score,
				percentage: submission.percentage || 0,
				started_at: submission.started_at || new Date(),
				submitted_at: submission.submitted_at,
				time_taken: submission.time_taken,
				answers: submission.answers || [],
			};
			state.submissions = [...state.submissions, newSubmission];
		},
		deleteSubmission: (state, { payload: submissionId }) => {
			state.submissions = state.submissions.filter(
				(s: Submission) => s.id !== submissionId,
			);
		},
		editSubmission: (state, { payload: updatedSubmission }) => {
			state.submissions = state.submissions.map((s: Submission) =>
				s.id === updatedSubmission.id ? { ...s, ...updatedSubmission } : s,
			);
		},
		updateSubmissionAnswer: (
			state,
			{ payload: { submissionId, questionId, answer } },
		) => {
			const submission = state.submissions.find(
				(s: Submission) => s.id === submissionId,
			);
			if (submission) {
				const existingAnswerIndex = submission.answers.findIndex(
					(a: SubmissionAnswer) => a.question === questionId,
				);
				if (existingAnswerIndex >= 0) {
					submission.answers[existingAnswerIndex] = {
						...submission.answers[existingAnswerIndex],
						...answer,
					};
				} else {
					submission.answers.push({
						question: questionId,
						selected_choice: answer.selected_choice,
						boolean_answer: answer.boolean_answer,
						text_answer: answer.text_answer,
						points_earned: answer.points_earned || 0,
						max_points: answer.max_points,
						is_correct: answer.is_correct,
					});
				}
			}
		},
		submitSubmission: (state, { payload: submissionId }) => {
			const submission = state.submissions.find(
				(s: Submission) => s.id === submissionId,
			);
			if (submission) {
				submission.status = 'submitted';
				submission.submitted_at = new Date();
				if (submission.max_possible_score > 0) {
					submission.percentage =
						(submission.total_score / submission.max_possible_score) * 100;
				}
			}
		},
	},
});

export const {
	addSubmission,
	deleteSubmission,
	editSubmission,
	setSubmissions,
	updateSubmissionAnswer,
	submitSubmission,
} = submissionsSlice.actions;

export default submissionsSlice.reducer;
