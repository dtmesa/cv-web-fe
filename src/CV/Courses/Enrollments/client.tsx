import axios from 'axios';

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const ENROLLMENTS_API = `${REMOTE_SERVER}/api/enrollments`;
const axiosWithCredentials = axios.create({ withCredentials: true });

export const deleteEnrollment = async (enrollmentId: string) => {
	const response = await axiosWithCredentials.delete(
		`${ENROLLMENTS_API}/${enrollmentId}`,
	);
	return response.data;
};
