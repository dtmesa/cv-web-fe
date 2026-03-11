import axios from 'axios';

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const ASSIGNMENTS_API = `${REMOTE_SERVER}/api/assignments`;
const axiosWithCredentials = axios.create({ withCredentials: true });

export const deleteAssignment = async (assignmentId: string) => {
	const response = await axiosWithCredentials.delete(
		`${ASSIGNMENTS_API}/${assignmentId}`,
	);
	return response.data;
};

export const updateAssignment = async (assignment: Assignment) => {
	const { data } = await axiosWithCredentials.put(
		`${ASSIGNMENTS_API}/${assignment.id}`,
		assignment,
	);
	return data;
};
