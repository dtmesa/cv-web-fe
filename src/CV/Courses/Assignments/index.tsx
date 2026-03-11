import { useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';
import { BsGripVertical, BsPlus } from 'react-icons/bs';
import { FaCaretDown, FaSearch, FaTrash } from 'react-icons/fa';
import { FaFilePen } from 'react-icons/fa6';
import { IoEllipsisVertical } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FacultyGated } from '../../Account/ProtectedRoute';
import type { RootState } from '../../store';
import * as coursesClient from '../client';
import GreenCheckmark from '../Modules/GreenCheckmark';
import * as assignmentsClient from './client';
import { deleteAssignment, setAssignments } from './reducer';

function formatDateTime(dateStr: string) {
	const date = new Date(dateStr);
	const month = date.toLocaleString('en-US', { month: 'long' });
	const day = date.getDate();
	const time = date.toLocaleString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});
	return `${month} ${day} at ${time}`;
}

export default function Assignments() {
	const { cid } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { assignments } = useSelector(
		(state: RootState) => state.assignmentsReducer,
	);

	const removeAssignment = async (assignmentId: string) => {
		await assignmentsClient.deleteAssignment(assignmentId);
		dispatch(deleteAssignment(assignmentId));
	};

	const fetchAssignments = async () => {
		const assignments = await coursesClient.findAssignmentsForCourse(
			cid as string,
		);
		dispatch(setAssignments(assignments));
	};
	useEffect(() => {
		fetchAssignments();
	}, []);

	function handleDelete(id: string) {
		if (window.confirm('Are you sure you want to remove this assignment?')) {
			removeAssignment(id);
		}
	}

	return (
		<div id="wd-assignments">
			<div className="mb-3 d-flex justify-content-between align-items-center">
				<div className="position-relative" style={{ width: '300px' }}>
					<FaSearch
						className="position-absolute text-muted"
						style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}
					/>
					<input
						placeholder="Search for Assignment"
						id="wd-search-assignment"
						className="form-control"
						style={{ paddingLeft: '35px' }}
					/>
				</div>
				<div>
					<FacultyGated>
						<button
							id="wd-add-assignment-group"
							className="btn bg-secondary-subtle me-2 border border-dark"
						>
							<BsPlus className="fs-4" /> Group
						</button>
						<button
							id="wd-add-assignment"
							className="btn btn-danger me-2 border border-dark"
							onClick={() => navigate(`/CV/Courses/${cid}/Assignments/new`)}
						>
							<BsPlus className="fs-4" /> Assignment
						</button>
						<button
							id="wd-assignment-ellipsis"
							className="btn bg-secondary-subtle border border-dark"
						>
							<IoEllipsisVertical className="fs-4" />
						</button>
					</FacultyGated>
				</div>
			</div>

			<ListGroup id="wd-assignment-list" className="rounded-0">
				<ListGroup.Item className="wd-assignment-group p-0 mb-5 fs-5 border-gray">
					<div className="wd-title p-3 ps-2 bg-secondary-subtle">
						<BsGripVertical className="me-2 fs-3" />
						<FaCaretDown className="me-2" />
						ASSIGNMENTS
						<div className="d-flex align-items-center float-end">
							<span className="badge text-dark me-2 px-3 py-2 rounded-pill border border-dark">
								40% of Total
							</span>
							<button className="btn btn-sm me-2">
								<BsPlus className="fs-4" />
							</button>
							<IoEllipsisVertical />
						</div>
					</div>

					{assignments.length > 0 && (
						<ListGroup className="wd-assignments rounded-0">
							{assignments.map((assignment: Assignment) => (
								<ListGroup.Item
									key={assignment.id}
									className="wd-assignment p-3 ps-1 border-0 border-start border-3 border-success"
								>
									<div className="d-flex justify-content-between align-items-center">
										<div className="d-flex align-items-center">
											<BsGripVertical className="me-3 fs-3" />
											<FacultyGated>
												<button
													className="btn btn-sm text-danger me-3"
													onClick={() =>
														navigate(
															`/CV/Courses/${cid}/Assignments/${assignment.id}`,
														)
													}
													title="Edit Assignment"
												>
													<FaFilePen className="fs-5" />
												</button>
											</FacultyGated>
											<div>
												<strong>
													<a
														href={`#/CV/Courses/${cid}/Assignments/${assignment.id}`}
														className="wd-assignment-link text-decoration-none text-dark"
													>
														{assignment.title}
													</a>
												</strong>
												<br />
												<span className="text-muted small">
													<span className="text-danger">Multiple Modules</span>{' '}
													&nbsp;|&nbsp;
													<strong> Due</strong>{' '}
													{formatDateTime(
														typeof assignment.due_date === 'string'
															? assignment.due_date
															: assignment.due_date.toISOString(),
													)}{' '}
													&nbsp;|&nbsp; {assignment.points} pts
												</span>
											</div>
										</div>
										<FacultyGated>
											<div className="d-flex align-items-center">
												<GreenCheckmark />
												<button
													className="btn btn-sm text-danger ms-3"
													title="Delete Assignment"
													onClick={() => handleDelete(assignment.id)}
												>
													<FaTrash className="fs-5" />
												</button>
												<IoEllipsisVertical className="ms-3" />
											</div>
										</FacultyGated>
									</div>
								</ListGroup.Item>
							))}
						</ListGroup>
					)}
				</ListGroup.Item>
			</ListGroup>
		</div>
	);
}
