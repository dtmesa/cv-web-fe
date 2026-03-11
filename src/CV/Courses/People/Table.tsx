import { Table } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import PeopleDetails from './Details';

export default function PeopleTable({ users = [] }: { users?: User[] }) {
	return (
		<div id="wd-people-table">
			<PeopleDetails />
			<Table striped>
				<thead>
					<tr>
						<th>Name</th>
						<th>Login ID</th>
						<th>Section</th>
						<th>Role</th>
						<th>Last Activity</th>
						<th>Total Activity</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user: User) => (
						<tr key={user.id}>
							<td className="wd-full-name text-nowrap">
								<Link
									to={`/CV/Account/Users/${user.id}`}
									className="text-decoration-none"
								>
									<FaUserCircle className="me-2 fs-1 text-secondary" />
									<span className="wd-first-name">{user.firstName}</span>&nbsp;
									<span className="wd-last-name">{user.lastName}</span>
								</Link>
							</td>
							<td className="wd-login-id">{user.loginId}</td>
							<td className="wd-section">{user.section}</td>
							<td className="wd-role">{user.role}</td>
							<td className="wd-last-activity">
								{user.lastActivity
									? user.lastActivity instanceof Date
										? user.lastActivity.toLocaleString()
										: user.lastActivity
									: ''}
							</td>
							<td className="wd-total-activity">{user.totalActivity}</td>
						</tr>
					))}
				</tbody>
			</Table>
		</div>
	);
}
