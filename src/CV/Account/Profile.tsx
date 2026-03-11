import { useEffect, useState } from 'react';
import { Button, FormControl, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import type { RootState } from '../store';
import * as client from './client';
import { setCurrentUser } from './reducer';

export default function Profile() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { currentUser } = useSelector(
		(state: RootState) => state.accountReducer,
	);
	const [profile, setProfile] = useState<User>();
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const updateProfile = async () => {
		if (!profile) {
			throw new Error('User profile information not found. Session error.');
		}
		const updatedProfile = await client.updateUser(profile);
		dispatch(setCurrentUser(updatedProfile));
	};

	const fetchProfile = () => {
		if (!currentUser) return navigate('/CV/Account/Signin');
		setProfile({
			...currentUser,
			dob: currentUser.dob
				? typeof currentUser.dob === 'string'
					? currentUser.dob.split('T')[0]
					: currentUser.dob.toISOString().split('T')[0]
				: '',
		});
	};

	const signout = async () => {
		await client.signout();
		dispatch(setCurrentUser(null));
		navigate('/CV/Account/Signin');
	};

	useEffect(() => {
		fetchProfile();
	}, []);

	return (
		<div className="wd-profile-screen">
			<h3>Profile</h3>
			{profile && (
				<div>
					<FormControl
						value={profile.username}
						id="wd-username"
						className="mb-2"
						placeholder="Username"
						onChange={(e) =>
							setProfile({ ...profile, username: e.target.value })
						}
					/>

					<InputGroup className="mb-2">
						<FormControl
							value={profile.password}
							id="wd-password"
							placeholder="Password"
							type={showPassword ? 'text' : 'password'}
							onChange={(e) =>
								setProfile({ ...profile, password: e.target.value })
							}
						/>
						<Button
							variant="outline-secondary"
							onClick={() => setShowPassword(!showPassword)}
							style={{ border: '1px solid #ced4da', borderLeft: 'none' }}
						>
							{showPassword ? <FaEyeSlash /> : <FaEye />}
						</Button>
					</InputGroup>

					<FormControl
						value={profile.firstName}
						id="wd-firstname"
						className="mb-2"
						placeholder="First Name"
						onChange={(e) =>
							setProfile({ ...profile, firstName: e.target.value })
						}
					/>
					<FormControl
						value={profile.lastName}
						id="wd-lastname"
						className="mb-2"
						placeholder="Last Name"
						onChange={(e) =>
							setProfile({ ...profile, lastName: e.target.value })
						}
					/>
					<FormControl
						value={
							profile.dob
								? typeof profile.dob === 'string'
									? profile.dob
									: profile.dob.toISOString().split('T')[0]
								: ''
						}
						id="wd-dob"
						className="mb-2"
						onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
						type="date"
					/>
					<FormControl
						value={profile.email}
						id="wd-email"
						className="mb-2"
						placeholder="Email"
						onChange={(e) => setProfile({ ...profile, email: e.target.value })}
					/>

					<select
						value={profile.role || ''}
						onChange={(e) => setProfile({ ...profile, role: e.target.value })}
						className="form-control mb-2"
						id="wd-role"
					>
						<option value="" disabled>
							Select role
						</option>
						<option value="USER">User</option>
						<option value="ADMIN">Admin</option>
						<option value="FACULTY">Faculty</option>
						<option value="STUDENT">Student</option>
					</select>

					<Button
						onClick={updateProfile}
						className="btn btn-primary w-100 mb-2"
						id="wd-updateProfile-btn"
					>
						Update
					</Button>

					<Button
						onClick={signout}
						className="btn btn-danger w-100 mb-2"
						id="wd-signout-btn"
					>
						Sign out
					</Button>
				</div>
			)}
		</div>
	);
}
