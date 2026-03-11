import { useState } from 'react';
import { Button, FormControl } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import * as client from './client';
import { setCurrentUser } from './reducer';

export default function Signin() {
	const [credentials, setCredentials] = useState<User>({
		username: '',
		password: '',
	});
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const signin = async () => {
		const user = await client.signin(credentials);
		if (!user) return;
		dispatch(setCurrentUser(user));
		navigate('/CV/Dashboard');
	};

	return (
		<div id="wd-signin-screen">
			<h1>Sign in</h1>
			<FormControl
				defaultValue={credentials.username}
				onChange={(e) =>
					setCredentials({ ...credentials, username: e.target.value })
				}
				className="mb-2"
				placeholder="Username"
				id="wd-username"
			/>
			<FormControl
				defaultValue={credentials.password}
				onChange={(e) =>
					setCredentials({ ...credentials, password: e.target.value })
				}
				className="mb-2"
				placeholder="Password"
				type="password"
				id="wd-password"
			/>
			<Button onClick={signin} id="wd-signin-btn" className="w-100">
				{' '}
				Sign in{' '}
			</Button>
			<Link
				id="wd-signup-link"
				to="/CV/Account/Signup"
				className="btn btn-success w-100 mt-2"
			>
				{' '}
				Sign up
			</Link>
		</div>
	);
}
