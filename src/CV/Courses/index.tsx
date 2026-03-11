import { useEffect, useState } from 'react';
import { FaAlignJustify } from 'react-icons/fa';
import { Route, Routes, useLocation, useParams } from 'react-router';

import Assignments from './Assignments';
import AssignmentEditor from './Assignments/Editor';
import * as userClient from './client';
import Home from './Home';
import Modules from './Modules';
import CourseNavigation from './Navigation';
import PeopleTable from './People/Table';
import Quizzes from './Quizzes';
import QuizDetails from './Quizzes/Details';
import QuizEditor from './Quizzes/Editor';
import QuizPreview from './Quizzes/Preview';
import QuestionEditor from './Quizzes/Questions/Editor';
import QuizSubmission from './Quizzes/Submission';

export default function Courses({ courses }: { courses: Course[] }) {
	const { cid } = useParams();
	const course = courses.find((course) => course.id === cid);
	const { pathname } = useLocation();

	const [users, setUsers] = useState<User[]>([]);
	useEffect(() => {
		if (!cid) return;
		userClient.findUsersForCourse(cid).then(setUsers);
	}, [cid]);

	return (
		<div id="wd-courses">
			<h2>
				<span className="text-danger">
					<FaAlignJustify className="me-4 fs-4 mb-1" />
					{course?.name ?? ''} &gt;
				</span>
				<span className="text-dark"> {pathname.split('/')[4]}</span>
			</h2>{' '}
			<hr />
			<div className="d-flex">
				<div className="d-none d-md-block">
					<CourseNavigation />
				</div>
				<div className="flex-fill">
					<Routes>
						<Route path="Home" element={<Home />} />
						<Route path="Modules" element={<Modules />} />
						<Route path="Assignments" element={<Assignments />} />
						<Route path="Assignments/:aid" element={<AssignmentEditor />} />
						<Route path="Quizzes" element={<Quizzes />} />
						<Route path="Quizzes/:qid/edit" element={<QuizEditor />} />
						<Route path="Quizzes/:qid/preview" element={<QuizPreview />} />
						<Route
							path="Quizzes/:qid/submission"
							element={<QuizSubmission />}
						/>
						<Route path="Quizzes/:qid" element={<QuizDetails />} />
						<Route path="Quizzes/new" element={<QuizEditor />} />
						<Route
							path="Quizzes/:qid/Questions/Editor"
							element={<QuestionEditor />}
						/>
						<Route
							path="Quizzes/:qid/Questions/Editor/:questionId"
							element={<QuestionEditor />}
						/>
						<Route path="People" element={<PeopleTable users={users} />} />
					</Routes>
				</div>{' '}
			</div>
		</div>
	);
}
