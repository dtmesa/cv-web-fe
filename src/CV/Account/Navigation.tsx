import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import type { RootState } from '../store';
import './style.css';

export default function AccountNavigation() {
	const { currentUser } = useSelector(
		(state: RootState) => state.accountReducer,
	);

	const links = currentUser
		? [{ label: 'Profile', path: 'Profile' }]
		: [
				{ label: 'Sign in', path: 'Signin' },
				{ label: 'Sign up', path: 'Signup' },
			];

	const { pathname } = useLocation();
	const active = (path: string) => (pathname.includes(path) ? 'active' : '');

	return (
		<div id="wd-account-navigation" className="account-nav">
			{links.map((link) => {
				const route = `/CV/Account/${link.path}`;
				return (
					<Link
						key={link.path}
						to={route}
						className={`account-link ${active(link.path)}`}
					>
						{link.label}
					</Link>
				);
			})}

			{currentUser && currentUser.role === 'ADMIN' && (
				<Link
					to={`/CV/Account/Users`}
					className={`account-link ${active('Users')}`}
				>
					Users
				</Link>
			)}
		</div>
	);
}
