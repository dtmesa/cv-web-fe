import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';
import * as userClient from '../Account/client';
import type { RootState } from '../store';

interface ProtectedRouteProps {
	children: ReactNode;
	courses?: Course[];
	enrolling?: boolean;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { currentUser } = useSelector(
		(state: RootState) => state.accountReducer,
	);
	const { cid } = useParams<{ cid: string }>();
	const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchEnrolledCourses = async () => {
			if (currentUser?.id) {
				try {
					const userEnrolledCourses = await userClient.findCoursesForUser(
						currentUser.id,
					);
					setEnrolledCourses(userEnrolledCourses);
				} catch (error) {
					console.error('Error fetching enrolled courses:', error);
					setEnrolledCourses([]);
				}
			}
			setLoading(false);
		};

		fetchEnrolledCourses();
	}, [currentUser]);

	if (!currentUser) {
		return <Navigate to="/Kambaz/Account/Signin" />;
	}

	if (loading) {
		return <div>Loading...</div>;
	}

	if (cid) {
		if (currentUser.role === 'FACULTY') {
			return <>{children}</>;
		}

		const isEnrolled = enrolledCourses.some(
			(course: Course) => course.id === cid,
		);

		if (!isEnrolled) {
			return <Navigate to="/Kambaz/Dashboard" />;
		}
	}

	return <>{children}</>;
}

export function FacultyGated({ children }: { children: ReactNode }) {
	const { currentUser } = useSelector(
		(state: RootState) => state.accountReducer,
	);
	return currentUser?.role === 'FACULTY' ? <>{children}</> : null;
}

export function isStudent(): boolean {
	const { currentUser } = useSelector(
		(state: RootState) => state.accountReducer,
	);
	return currentUser?.role === 'STUDENT';
}
