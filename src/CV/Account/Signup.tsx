import { useEffect, useState } from 'react';
import { FormControl } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import * as client from './client';
import { setCurrentUser } from './reducer';

export default function Signup() {
	const [user, setUser] = useState<User>({
		username: '',
		password: '',
	});
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const signup = async () => {
		const currentUser = await client.signup(user);
		dispatch(setCurrentUser(currentUser));
		navigate('/CV/Account/Profile');
	};

	useEffect(() => {
		document.title = 'Account';
	}, []);

	return (
		<div className="wd-signup-screen">
			<h1>Sign up</h1>
			<FormControl
				value={user.username}
				onChange={(e) => setUser({ ...user, username: e.target.value })}
				className="wd-username mb-2"
				placeholder="Username"
			/>
			<FormControl
				value={user.password}
				onChange={(e) => setUser({ ...user, password: e.target.value })}
				className="wd-password mb-2"
				placeholder="Password"
				type="password"
			/>
			<button
				onClick={signup}
				className="wd-signup-btn btn btn-danger mb-2 w-100"
			>
				Create account
			</button>
			<br />
			<Link to="/CV/Account/Signin" className="btn btn-primary w-100 mb-2">
				{' '}
				Sign in
			</Link>
		</div>
	);
}
