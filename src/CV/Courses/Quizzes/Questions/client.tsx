import axios from 'axios';

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const QUIZZES_API = `${REMOTE_SERVER}/api/quizzes`;
const axiosWithCredentials = axios.create({ withCredentials: true });

export const deleteQuestion = async (quizId: string, questionId: string) => {
	const response = await axiosWithCredentials.delete(
		`${QUIZZES_API}/${quizId}/questions/${questionId}`,
	);
	return response.data;
};

export const updateQuestion = async (quizId: string, question: Question) => {
	const { data } = await axiosWithCredentials.put(
		`${QUIZZES_API}/${quizId}/questions/${question.id}`,
		question,
	);
	return data;
};
