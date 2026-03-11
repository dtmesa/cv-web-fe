import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';
import * as userClient from '../Account/client';
import type { RootState } from '../store';
import './style.css';

export default function CourseNavigation() {
	const links = [
		{ name: 'Home', id: 'wd-course-home-link' },
		{ name: 'Modules', id: 'wd-course-modules-link' },
		{ name: 'Piazza', id: 'wd-course-piazza-link' },
		{ name: 'Zoom', id: 'wd-course-zoom-link' },
		{ name: 'Assignments', id: 'wd-course-assignments-link' },
		{ name: 'Quizzes', id: 'wd-course-quizzes-link' },
		{ name: 'Grades', id: 'wd-course-grades-link' },
		{ name: 'People', id: 'wd-course-people-link' },
	];

	const { cid } = useParams<{ cid: string }>();
	const location = useLocation();
	const { currentUser } = useSelector(
		(state: RootState) => state.accountReducer,
	);

	const [courses, setCourses] = useState<Course[]>([]);
	const [course, setCourse] = useState<Course | null>(null);

	useEffect(() => {
		const fetchUserCourses = async () => {
			if (!currentUser || !currentUser.id) {
				throw new Error('Login error: User not found!');
			}
			try {
				const userCourses: Course[] = await userClient.findCoursesForUser(
					currentUser.id,
				);
				setCourses(userCourses || []);

				const currentCourse = courses.find((c) => c.id === cid);
				setCourse(currentCourse ?? courses[0] ?? null);
			} catch (error) {
				console.error(error);
				setCourses([]);
				setCourse(null);
			}
		};

		fetchUserCourses();
	}, [currentUser, cid]);

	if (!course || !course.id) return <div>Loading...</div>;

	return (
		<div id="wd-courses-navigation" className="wd list-group fs-5 rounded-0">
			{links.map((link, index) => (
				<Link
					key={index}
					to={`/CV/Courses/${course.id}/${link.name}`}
					id={link.id}
					className={`list-group-item ${
						location.pathname.includes(link.name) ? 'active' : ''
					}`}
				>
					{link.name}
				</Link>
			))}
		</div>
	);
}
