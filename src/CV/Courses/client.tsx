import axios from 'axios';

const axiosWithCredentials = axios.create({ withCredentials: true });
const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const COURSES_API = `${REMOTE_SERVER}/api/courses`;
const USERS_API = `${REMOTE_SERVER}/api/users`;

export const createModuleForCourse = async (
	courseId: string,
	module: CVModule,
) => {
	const response = await axiosWithCredentials.post(
		`${COURSES_API}/${courseId}/modules`,
		module,
	);
	return response.data;
};

export const findModulesForCourse = async (courseId: string) => {
	const response = await axiosWithCredentials.get(
		`${COURSES_API}/${courseId}/modules`,
	);
	return response.data;
};

export const fetchAllCourses = async () => {
	const { data } = await axiosWithCredentials.get(COURSES_API);
	return data;
};

export const updateCourse = async (course: Course) => {
	const { data } = await axiosWithCredentials.put(
		`${COURSES_API}/${course.id}`,
		course,
	);
	return data;
};

export const deleteCourse = async (id: string) => {
	const { data } = await axiosWithCredentials.delete(`${COURSES_API}/${id}`);
	return data;
};

export const createCourse = async (course: Course) => {
	const { data } = await axiosWithCredentials.post(COURSES_API, course);
	return data;
};

export const createAssignmentForCourse = async (
	courseId: string,
	assignment: Assignment,
) => {
	const response = await axiosWithCredentials.post(
		`${COURSES_API}/${courseId}/assignments`,
		assignment,
	);
	return response.data;
};

export const findAssignmentsForCourse = async (courseId: string) => {
	const response = await axiosWithCredentials.get(
		`${COURSES_API}/${courseId}/assignments`,
	);
	return response.data;
};

export const createQuizForCourse = async (courseId: string, quiz: Quiz) => {
	const response = await axiosWithCredentials.post(
		`${COURSES_API}/${courseId}/quizzes`,
		quiz,
	);
	return response.data;
};

export const findQuizzesForCourse = async (courseId: string) => {
	const response = await axiosWithCredentials.get(
		`${COURSES_API}/${courseId}/quizzes`,
	);
	return response.data;
};

export const findEnrollmentsForUser = async (userId: string) => {
	const response = await axiosWithCredentials.get(
		`${USERS_API}/${userId}/enrollments`,
	);
	return response.data;
};

export const enrollUserInCourse = async (userId: string, courseId: string) => {
	const response = await axiosWithCredentials.post(
		`${COURSES_API}/${courseId}/enrollments`,
		{
			user: userId,
		},
	);
	return response.data;
};

export const findUsersForCourse = async (courseId: string) => {
	const response = await axiosWithCredentials.get(
		`${COURSES_API}/${courseId}/users`,
	);
	return response.data;
};
