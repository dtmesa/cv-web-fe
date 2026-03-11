import axios from 'axios';

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const QUIZZES_API = `${REMOTE_SERVER}/api/quizzes`;
const axiosWithCredentials = axios.create({ withCredentials: true });

export const deleteQuiz = async (quizId: string) => {
	const response = await axiosWithCredentials.delete(
		`${QUIZZES_API}/${quizId}`,
	);
	return response.data;
};

export const updateQuiz = async (quiz: Quiz) => {
	const { data } = await axiosWithCredentials.put(
		`${QUIZZES_API}/${quiz.id}`,
		quiz,
	);
	return data;
};

export const findSubmissionsForQuiz = async (
	quizId: string,
	userId: string,
) => {
	const response = await axiosWithCredentials.get(
		`${QUIZZES_API}/${quizId}/submissions?userId=${userId}`,
	);
	return response.data;
};

export const createSubmission = async (
	quizId: string,
	submission: Submission,
) => {
	const response = await axiosWithCredentials.post(
		`${QUIZZES_API}/${quizId}/submissions`,
		submission,
	);
	return response.data;
};

export const findSubmissionsById = async (
	quizId: string,
	submissionId: string,
) => {
	const res = await axiosWithCredentials.get(
		`${QUIZZES_API}/${quizId}/submissions/${submissionId}`,
	);
	return res.data;
};

export const findQuestionsForQuiz = async (quizId: string) => {
	const response = await axiosWithCredentials.get(
		`${QUIZZES_API}/${quizId}/questions`,
	);
	return response.data;
};

export const createQuestion = async (quizId: string, question: Question) => {
	const response = await axiosWithCredentials.post(
		`${QUIZZES_API}/${quizId}/questions`,
		{
			...question,
			quiz: quizId,
		},
	);
	return response.data;
};

export const findQuestionById = async (quizId: string, questionId: string) => {
	const res = await axiosWithCredentials.get(
		`${QUIZZES_API}/${quizId}/questions/${questionId}`,
	);
	return res.data;
};
