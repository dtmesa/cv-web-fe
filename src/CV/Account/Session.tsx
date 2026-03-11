import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as client from './client';
import { setCurrentUser } from './reducer';

export default function Session({ children }: PropsWithChildren) {
	const [pending, setPending] = useState(true);
	const dispatch = useDispatch();

	const fetchProfile = async () => {
		try {
			const currentUser = await client.profile();
			dispatch(setCurrentUser(currentUser));
		} catch (error: unknown) {
			console.error(error);
		}
		setPending(false);
	};

	useEffect(() => {
		fetchProfile();
	}, []);

	if (pending) {
		return <div>Loading...</div>;
	}

	return <>{children}</>;
}
