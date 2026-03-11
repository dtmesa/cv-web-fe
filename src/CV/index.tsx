import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router';

import Account from './Account';
import * as userClient from './Account/client';
import ProtectedRoute from './Account/ProtectedRoute';
import Session from './Account/Session';
import Courses from './Courses';
import * as courseClient from './Courses/client';
import Dashboard from './Dashboard';
import CVNavigation from './Navigation';
import type { RootState } from './store';
import './styles.css';

export default function CV() {
	const [courses, setCourses] = useState<Course[]>([]);
	const [course, setCourse] = useState({ name: '', description: '', id: '' });
	const { currentUser } = useSelector(
		(state: RootState) => state.accountReducer,
	);
	const [enrolling, setEnrolling] = useState<boolean>(false);

	const findCoursesForUser = async () => {
		if (!currentUser || !currentUser.id) {
			return;
		}
		try {
			const courses = await userClient.findCoursesForUser(currentUser.id);
			setCourses(courses);
		} catch (error: unknown) {
			console.error(error);
		}
	};

	const fetchCourses = async () => {
		if (!currentUser || !currentUser.id) {
			return;
		}
		try {
			const allCourses = await courseClient.fetchAllCourses();
			const enrolledCourses = await userClient.findCoursesForUser(
				currentUser.id,
			);
			const courses = allCourses.map((course: Course) => {
				if (enrolledCourses.find((c: Course) => c.id === course.id)) {
					return { ...course, enrolled: true };
				} else {
					return course;
				}
			});
			setCourses(courses);
		} catch (error: unknown) {
			console.error(error);
		}
	};

	const updateEnrollment = async (courseId: string, enrolled: boolean) => {
		if (!currentUser || !currentUser.id) {
			throw new Error('Enrollment failed to update. User not found.');
		} else if (enrolled) {
			await userClient.enrollIntoCourse(currentUser.id, courseId);
		} else {
			await userClient.unenrollFromCourse(currentUser.id, courseId);
		}
		setCourses(
			courses.map((course) => {
				if (course.id === courseId) {
					return { ...course, enrolled: enrolled };
				} else {
					return course;
				}
			}),
		);
	};

	useEffect(() => {
		if (enrolling) {
			fetchCourses();
		} else {
			findCoursesForUser();
		}
	}, [enrolling]);

	const addNewCourse = async () => {
		const newCourse = await courseClient.createCourse(course);
		setCourses([...courses, newCourse]);
	};

	const deleteCourse = async (courseId: string) => {
		await courseClient.deleteCourse(courseId);
		setCourses(courses.filter((course) => course.id !== courseId));
	};

	const updateCourse = async (updatedCourse: Course) => {
		await courseClient.updateCourse(updatedCourse);
		setCourses(
			courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)),
		);
		setCourse({ name: '', description: '', id: '' });
	};

	return (
		<Session>
			<div id="wd-cv">
				<CVNavigation />
				<div className="wd-main-content-offset p-3">
					<Routes>
						<Route path="/" element={<Navigate to="Account" />} />
						<Route path="/Account/*" element={<Account />} />
						<Route
							path="/Dashboard"
							element={
								<Dashboard
									courses={courses}
									course={course}
									setCourse={setCourse}
									addNewCourse={addNewCourse}
									deleteCourse={deleteCourse}
									updateCourse={updateCourse}
									enrolling={enrolling}
									setEnrolling={setEnrolling}
									updateEnrollment={updateEnrollment}
								/>
							}
						/>
						<Route
							path="Courses/:cid/*"
							element={
								<ProtectedRoute courses={courses}>
									<Courses courses={courses} />
								</ProtectedRoute>
							}
						/>
						<Route path="/Calendar" element={<h1>Calendar</h1>} />
						<Route path="/Inbox" element={<h1>Inbox</h1>} />
					</Routes>
				</div>
			</div>
		</Session>
	);
}
