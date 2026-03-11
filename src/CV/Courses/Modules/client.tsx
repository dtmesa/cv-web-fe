import axios from 'axios';

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const MODULES_API = `${REMOTE_SERVER}/api/modules`;
const axiosWithCredentials = axios.create({ withCredentials: true });

export const deleteModule = async (moduleId: string) => {
	const response = await axiosWithCredentials.delete(
		`${MODULES_API}/${moduleId}`,
	);
	return response.data;
};

export const updateModule = async (module: CVModule) => {
	const { data } = await axiosWithCredentials.put(
		`${MODULES_API}/${module.id}`,
		module,
	);
	return data;
};
