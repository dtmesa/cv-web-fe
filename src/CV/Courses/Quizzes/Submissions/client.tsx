import axios from 'axios';

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const QUIZZES_API = `${REMOTE_SERVER}/api/quizzes`;
const axiosWithCredentials = axios.create({ withCredentials: true });

export const deleteSubmission = async (
	quizId: string,
	submissionId: string,
) => {
	const response = await axiosWithCredentials.delete(
		`${QUIZZES_API}/${quizId}/submissions/${submissionId}`,
	);
	return response.data;
};

export const updateSubmission = async (
	quizId: string,
	submission: Submission,
) => {
	const { data } = await axiosWithCredentials.put(
		`${QUIZZES_API}/${quizId}/submissions/${submission.id}`,
		submission,
	);
	return data;
};
