import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { RootState } from '../../store';
import * as coursesClient from '../client';
import * as assignmentsClient from './client';
import { addAssignment, editAssignment } from './reducer';

export default function AssignmentEditor() {
	const { cid, aid } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { assignments } = useSelector(
		(state: RootState) => state.assignmentsReducer,
	);
	const assignment = assignments.find(
		(a: Assignment) => a.id === aid && a.course === cid,
	);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [points, setPoints] = useState(100);
	const [dueDate, setDueDate] = useState('');
	const [availableDate, setAvailableDate] = useState('');
	const [availableUntil, setAvailableUntil] = useState('');

	useEffect(() => {
		if (assignment) {
			setTitle(assignment.title);
			setDescription(assignment.description);
			setPoints(assignment.points);

			const formatDate = (d: string | Date) =>
				typeof d === 'string' ? d : d.toISOString().slice(0, 16);

			setDueDate(formatDate(assignment.due_date));
			setAvailableDate(formatDate(assignment.available_date));
			setAvailableUntil(formatDate(assignment.available_until));
		}
	}, [assignment]);

	const saveAssignment = async (assignmentData: Assignment) => {
		const updatedAssignment =
			await assignmentsClient.updateAssignment(assignmentData);
		dispatch(editAssignment(updatedAssignment));
	};

	const createAssignmentForCourse = async (assignmentData: Assignment) => {
		if (!cid) return;
		const newAssignment = await coursesClient.createAssignmentForCourse(
			cid,
			assignmentData,
		);
		dispatch(addAssignment(newAssignment));
	};

	async function handleSave() {
		if (!assignment) {
			throw new Error('Saved unsuccessful. Assignment not found.');
		}

		const assignmentData = {
			id: assignment.id,
			title,
			description,
			points,
			due_date: dueDate,
			available_date: availableDate,
			available_until: availableUntil,
			course: cid,
		};

		if (assignment) {
			await saveAssignment(assignmentData);
		} else {
			await createAssignmentForCourse(assignmentData);
		}

		navigate(`/CV/Courses/${cid}/Assignments`);
	}

	return (
		<div className="max-w-4xl mx-auto p-6 bg-white">
			<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
				<div className="divide-y divide-gray-200">
					<div className="p-4 flex">
						<div className="w-32 flex-shrink-0">
							<label
								htmlFor="wd-name"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Assignment Name
							</label>
						</div>
						<div className="flex-1 ml-4">
							<input
								id="wd-name"
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="px-3 py-2 border border-light-gray rounded"
								placeholder="New Assignment"
							/>
						</div>
					</div>
					<div className="p-4">
						<div className="mb-2">
							<label
								htmlFor="wd-description"
								className="block text-sm font-medium text-gray-700"
							>
								Description
							</label>
						</div>
						<textarea
							id="wd-description"
							rows={8}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="px-3 py-2 border border-light-gray rounded"
							placeholder="New Assignment Description"
						/>
					</div>
					<div className="p-4 flex">
						<div className="w-32 flex-shrink-0">
							<label
								htmlFor="wd-points"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Points
							</label>
						</div>
						<div className="flex-1 ml-4">
							<input
								id="wd-points"
								type="number"
								value={points}
								onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
								className="px-3 py-2 border border-light-gray rounded"
								min="0"
							/>
						</div>
					</div>
					<div className="p-4 flex">
						<div className="w-32 flex-shrink-0">
							<h3 className="text-sm font-medium text-gray-900">Assign</h3>
						</div>
						<div className="flex-1 ml-4">
							<div className="border border-gray-300 rounded-lg p-4 space-y-4">
								<div>
									<label
										htmlFor="wd-due-date"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Due
									</label>
									<input
										id="wd-due-date"
										type="datetime-local"
										value={dueDate}
										onChange={(e) => setDueDate(e.target.value)}
										className="px-3 py-2 border border-light-gray rounded"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label
											htmlFor="wd-available-from"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Available from
										</label>
										<input
											id="wd-available-from"
											type="datetime-local"
											value={availableDate}
											onChange={(e) => setAvailableDate(e.target.value)}
											className="px-3 py-2 border border-light-gray rounded"
										/>
									</div>
									<div>
										<label
											htmlFor="wd-available-until"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Until
										</label>
										<input
											id="wd-available-until"
											type="datetime-local"
											value={availableUntil}
											onChange={(e) => setAvailableUntil(e.target.value)}
											className="px-3 py-2 border border-light-gray rounded"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="px-4 py-3">
					<button
						type="button"
						onClick={() => navigate(`/CV/Courses/${cid}/Assignments`)}
						className="btn btn-light btn-outline-secondary"
					>
						Cancel
					</button>
					<button type="button" onClick={handleSave} className="btn btn-danger">
						Save
					</button>
				</div>
			</div>
		</div>
	);
}
