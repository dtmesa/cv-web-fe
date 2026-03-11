import { useEffect, useState } from 'react';
import { FormControl } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { useParams } from 'react-router';

import PeopleTable from '../Courses/People/Table';
import * as client from './client';

export default function Users() {
	const [users, setUsers] = useState<User[]>([]);
	const [role, setRole] = useState('');
	const [_name, setName] = useState('');

	const createUser = async () => {
		const newUser = await client.createUser({
			firstName: 'New',
			lastName: `User${users.length + 1}`,
			username: `newuser${Date.now()}`,
			password: 'password123',
			email: `email${users.length + 1}@neu.edu`,
			section: 'S101',
			role: 'STUDENT',
		});
		setUsers([...users, newUser]);
	};

	const filterUsersByName = async (filterName: string) => {
		setName(filterName);
		if (filterName) {
			const users = await client.findUsersByPartialName(filterName);
			setUsers(users);
		} else {
			fetchUsers();
		}
	};

	const filterUsersByRole = async (role: string) => {
		setRole(role);
		if (role) {
			const users = await client.findUsersByRole(role);
			setUsers(users);
		} else {
			fetchUsers();
		}
	};

	const { uid } = useParams();

	const fetchUsers = async () => {
		const users = await client.findAllUsers();
		setUsers(users);
	};

	useEffect(() => {
		fetchUsers();
	}, [uid]);

	return (
		<div>
			<button
				onClick={createUser}
				className="float-end btn btn-danger wd-add-people"
			>
				<FaPlus className="me-2" />
				Users
			</button>
			<FormControl
				onChange={(e) => filterUsersByName(e.target.value)}
				placeholder="Search people"
				className="float-start w-25 me-2 wd-filter-by-name"
			/>
			<select
				value={role}
				onChange={(e) => filterUsersByRole(e.target.value)}
				className="form-select float-start w-25 wd-select-role"
			>
				<option value="">All Roles</option>
				<option value="STUDENT">Students</option>
				<option value="TA">Assistants</option>
				<option value="FACULTY">Faculty</option>
				<option value="ADMIN">Administrators</option>
			</select>
			<PeopleTable users={users} />
		</div>
	);
}
