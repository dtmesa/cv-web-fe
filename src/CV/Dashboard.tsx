import { Button, Card, Col, FormControl, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { FacultyGated, isStudent } from './Account/ProtectedRoute';

export default function Dashboard({
	courses,
	course,
	setCourse,
	addNewCourse,
	deleteCourse,
	updateCourse,
	enrolling,
	setEnrolling,
	updateEnrollment,
}: {
	courses: Course[];
	course: Course;
	setCourse: (course: Course) => void;
	addNewCourse: () => Promise<void>;
	deleteCourse: (id: string) => void;
	updateCourse: (course: Course) => void;
	enrolling: boolean;
	setEnrolling: (enrolling: boolean) => void;
	updateEnrollment: (courseId: string, enrolled: boolean) => void;
}) {
	const student = isStudent();

	return (
		<div id="wd-dashboard">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h1 id="wd-dashboard-title">Dashboard</h1>
				<button
					onClick={() => setEnrolling(!enrolling)}
					className="float-end btn btn-primary"
				>
					{enrolling ? 'My Courses' : 'All Courses'}
				</button>
			</div>
			<hr />
			<FacultyGated>
				<h5>
					New Course
					<button
						className="btn btn-primary float-end"
						id="wd-add-new-course-click"
						onClick={async () => {
							if (!course.name.trim()) {
								alert('Course name cannot be empty.');
								return;
							}
							await addNewCourse();
							setCourse({ name: '', description: '', id: '' });
						}}
					>
						Add
					</button>
					<button
						className="btn btn-warning float-end me-2"
						id="wd-update-course-click"
						onClick={async () => {
							if (!course.id) {
								alert('Select a course to update first.');
								return;
							}
							await updateCourse(course);
							setCourse({ name: '', description: '', id: '' });
						}}
					>
						Update
					</button>
				</h5>
				<br />
				<FormControl
					value={course.name}
					className="mb-2"
					placeholder="Course Name"
					onChange={(e) => setCourse({ ...course, name: e.target.value })}
				/>
				<FormControl
					value={course.description}
					as="textarea"
					rows={3}
					placeholder="Course Description"
					onChange={(e) =>
						setCourse({ ...course, description: e.target.value })
					}
				/>
				<hr />
			</FacultyGated>

			<h2 id="wd-dashboard-published">
				{enrolling ? 'All Courses' : 'My Courses'} ({courses.length})
			</h2>
			<hr />
			<div id="wd-dashboard-courses">
				<Row xs={1} md={5} className="g-4">
					{courses.map((course: any) => (
						<Col
							className="wd-dashboard-course"
							style={{ width: '325px' }}
							key={course.id}
						>
							<Card>
								<Link
									to={`/CV/Courses/${course.id}/Home`}
									className="wd-dashboard-course-link text-decoration-none text-dark"
								>
									<Card.Img
										src={`/images/${course.id}.jpg`}
										variant="top"
										width="100%"
										height={160}
									/>
									<Card.Body className="card-body">
										<Card.Title className="wd-dashboard-course-title text-nowrap overflow-hidden">
											{course.name}
										</Card.Title>
										<Card.Text
											className="wd-dashboard-course-description overflow-hidden"
											style={{ height: '1px' }}
										>
											{course.description}
										</Card.Text>
										<Button className="btn btn-primary me-1">Go</Button>
										{student && enrolling && (
											<button
												onClick={(event) => {
													event.preventDefault();
													updateEnrollment(course.id, !course.enrolled);
												}}
												className={`btn ${course.enrolled ? 'btn-danger' : 'btn-success'} float-end`}
											>
												{course.enrolled ? 'Unenroll' : 'Enroll'}
											</button>
										)}
										<FacultyGated>
											<button
												onClick={async (event) => {
													event.preventDefault();
													await deleteCourse(course.id);
												}}
												className="btn btn-danger float-end"
												id="wd-delete-course-click"
											>
												Delete
											</button>
											<button
												id="wd-edit-course-click"
												onClick={(event) => {
													event.preventDefault();
													setCourse(course);
												}}
												className="btn btn-warning me-1 float-end"
											>
												Edit
											</button>
										</FacultyGated>
									</Card.Body>
								</Link>
							</Card>
						</Col>
					))}
				</Row>
			</div>
		</div>
	);
}
