import { useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router';

import type { RootState } from '../store';
import AccountNavigation from './Navigation';
import Profile from './Profile';
import Signin from './Signin';
import Signup from './Signup';
import Users from './Users';

export default function Account() {
	const { currentUser } = useSelector(
		(state: RootState) => state.accountReducer,
	);
	return (
		<div id="wd-account-screen">
			<table>
				<tbody>
					<tr>
						<td valign="top">
							<AccountNavigation />
						</td>
						<td valign="top">
							<Routes>
								<Route
									path="/"
									element={
										<Navigate
											to={
												currentUser
													? '/CV/Account/Profile'
													: '/CV/Account/Signin'
											}
										/>
									}
								/>
								<Route path="/Signin" element={<Signin />} />
								<Route path="/Profile" element={<Profile />} />
								<Route path="/Signup" element={<Signup />} />
								<Route path="/Users" element={<Users />} />
								<Route path="/Users/:uid" element={<Users />} />
							</Routes>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
