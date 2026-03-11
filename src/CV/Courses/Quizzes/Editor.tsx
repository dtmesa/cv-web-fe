import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import { BsPencil, BsPlus, BsTrash } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import type { RootState } from '../../store';
import * as coursesClient from '../client';
import * as quizzesClient from './client';
import * as questionsClient from './Questions/client';
import { addQuiz, editQuiz } from './reducer';
import '@uiw/react-md-editor/markdown-editor.css';

export default function QuizEditor() {
	const { cid, qid } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { quizzes } = useSelector((state: RootState) => state.quizzesReducer);
	const [activeTab, setActiveTab] = useState('details');
	const [questions, setQuestions] = useState([]);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [dueDate, setDueDate] = useState<string | Date>('');
	const [availableDate, setAvailableDate] = useState<string | Date>('');
	const [availableUntil, setAvailableUntil] = useState<string | Date>('');
	const [quizType, setQuizType] = useState('graded_quiz');
	const [assignmentGroup, setAssignmentGroup] = useState('quizzes');
	const [shuffleAnswers, setShuffleAnswers] = useState(true);
	const [timeLimit, setTimeLimit] = useState(10);
	const [multipleAttempts, setMultipleAttempts] = useState(false);
	const [numberOfAttempts, setNumberOfAttempts] = useState(1);
	const [showCorrectAnswers, setShowCorrectAnswers] =
		useState('after_due_date');
	const [accessCode, setAccessCode] = useState('');
	const [oneQuestionAtTime, setOneQuestionAtTime] = useState(true);
	const [webcamRequired, setWebcamRequired] = useState(false);
	const [published, _setPublished] = useState(false);
	const [howManyAttempts, setHowManyAttempts] = useState(1);
	const [lockQuestionsAfterAnswering, setLockQuestionsAfterAnswering] =
		useState(false);
	const quiz = quizzes.find((q: Quiz) => q.id === qid && q.course === cid);

	useEffect(() => {
		if (quiz) {
			setTitle(quiz.title);
			setDescription(quiz.description);
			setDueDate(
				quiz.due_date instanceof Date
					? quiz.due_date.toISOString()
					: quiz.due_date,
			);
			setAvailableDate(
				quiz.available_date instanceof Date
					? quiz.available_date.toISOString()
					: quiz.available_date,
			);
			setAvailableUntil(
				quiz.available_until instanceof Date
					? quiz.available_until.toISOString()
					: quiz.available_until,
			);
			setQuizType(quiz.quiz_type);
			setAssignmentGroup(quiz.assignment_group);
			setShuffleAnswers(quiz.shuffle_answers);
			setTimeLimit(quiz.time_limit);
			setMultipleAttempts(quiz.multiple_attempts);
			setNumberOfAttempts(quiz.number_of_attempts);
			setShowCorrectAnswers(quiz.show_correct_answers);
			setAccessCode(quiz.access_code ?? '');
			setOneQuestionAtTime(quiz.one_question_at_a_time);
			setWebcamRequired(quiz.webcam_required);
			setLockQuestionsAfterAnswering(quiz.lock_questions_after_answering);
			setHowManyAttempts(quiz.how_many_attempts);
		}
	}, [quiz]);

	useEffect(() => {
		if (qid) {
			fetchQuestions();
		}
	}, [qid]);

	const fetchQuestions = async () => {
		try {
			const fetchedQuestions = await quizzesClient.findQuestionsForQuiz(qid!);
			setQuestions(fetchedQuestions);
		} catch (error) {
			console.error('Error fetching questions:', error);
		}
	};

	const deleteQuestion = async (questionId: string) => {
		try {
			await questionsClient.deleteQuestion(qid!, questionId);
			await fetchQuestions();
		} catch (error) {
			console.error('Error deleting question:', error);
		}
	};

	const saveQuiz = async (quizData: Quiz) => {
		const updatedQuiz = await quizzesClient.updateQuiz(quizData);
		dispatch(editQuiz(updatedQuiz));
		return updatedQuiz;
	};

	const createQuizForCourse = async (quizData: Quiz) => {
		if (!cid) return;
		const newQuiz = await coursesClient.createQuizForCourse(cid, quizData);
		dispatch(addQuiz(newQuiz));
		return newQuiz;
	};

	async function handleSave() {
		if (!quiz) throw new Error('Error saving quiz. Quiz not found.');
		if (!cid) throw new Error('Error saving quiz. Quiz course ID not found.');

		const quizData = {
			id: quiz.id,
			title,
			description,
			due_date: dueDate,
			available_date: availableDate,
			available_until: availableUntil,
			quiz_type: quizType,
			assignment_group: assignmentGroup,
			shuffle_answers: shuffleAnswers,
			time_limit: timeLimit,
			multiple_attempts: multipleAttempts,
			number_of_attempts: numberOfAttempts,
			show_correct_answers: showCorrectAnswers,
			access_code: accessCode,
			one_question_at_time: oneQuestionAtTime,
			webcam_required: webcamRequired,
			lock_questions_after_answering: lockQuestionsAfterAnswering,
			published: published,
			course: cid,
			how_many_attempts: howManyAttempts,
			one_question_at_a_time: oneQuestionAtTime,
		};

		if (quiz) {
			await saveQuiz(quizData);
		} else {
			await createQuizForCourse(quizData);
		}

		navigate(`/CV/Courses/${cid}/Quizzes`);
	}

	async function handleSaveAndPublish() {
		if (!quiz) throw new Error('Error saving quiz. Quiz not found.');
		if (!cid) throw new Error('Error saving quiz. Quiz course ID not found.');

		const quizData = {
			id: quiz.id,
			title,
			description,
			due_date: dueDate,
			available_date: availableDate,
			available_until: availableUntil,
			quiz_type: quizType,
			assignment_group: assignmentGroup,
			shuffle_answers: shuffleAnswers,
			time_limit: timeLimit,
			multiple_attempts: multipleAttempts,
			number_of_attempts: numberOfAttempts,
			show_correct_answers: showCorrectAnswers,
			access_code: accessCode,
			one_question_at_a_time: oneQuestionAtTime,
			webcam_required: webcamRequired,
			lock_questions_after_answering: lockQuestionsAfterAnswering,
			how_many_attempts: howManyAttempts,
			published: true,
			course: cid,
		};

		if (quiz) {
			await saveQuiz(quizData);
		} else {
			await createQuizForCourse(quizData);
		}
		navigate(`/CV/Courses/${cid}/Quizzes`);
	}

	const renderDetailsTab = () => {
		const totalQuestionPoints = questions.reduce(
			(sum: number, q: Question) => sum + (q.points || 0),
			0,
		);

		return (
			<div className="divide-y divide-gray-200">
				<div className="px-4 py-2">
					<div className="mt-2">
						<input
							id="wd-name"
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded"
							placeholder="Enter quiz title"
						/>
					</div>
				</div>

				<div className="px-4 py-2">
					<div className="mb-2">
						<label htmlFor="wd-description">Quiz Instructions:</label>
					</div>
					<div className="border border-gray-300 rounded">
						<MDEditor
							value={description}
							onChange={(val) => setDescription(val || '')}
							preview="edit"
							height={200}
							visibleDragbar={false}
							data-color-mode="light"
						/>
					</div>
				</div>

				<div className="px-4 py-2">
					<div>
						<label htmlFor="wd-quiz-type" className="mb-1">
							Quiz Type
						</label>
					</div>
					<div className="flex-1 ml-4">
						<select
							id="wd-quiz-type"
							value={quizType}
							onChange={(e) => setQuizType(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded"
						>
							<option value="graded_quiz">Graded Quiz</option>
							<option value="practice_quiz">Practice Quiz</option>
							<option value="graded_survey">Graded Survey</option>
							<option value="ungraded_survey">Ungraded Survey</option>
						</select>
					</div>
				</div>

				<div className="px-4 py-2 flex">
					<div>
						<label className="mb-1 text-gray-500">
							Points: {totalQuestionPoints}
						</label>
					</div>
				</div>

				<div className="px-4 py-2 flex">
					<div className="w-32 flex-shrink-0">
						<label htmlFor="wd-assignment-group" className="mb-1">
							Assignment Group
						</label>
					</div>
					<div className="flex-1 ml-4">
						<select
							id="wd-assignment-group"
							value={assignmentGroup}
							onChange={(e) => setAssignmentGroup(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded"
						>
							<option value="quizzes">Quizzes</option>
							<option value="exams">Exams</option>
							<option value="assignments">Assignments</option>
							<option value="project">Project</option>
						</select>
					</div>
				</div>

				<div className="mt-3 px-4 py-6">
					<h5>Options</h5>
					<div className="space-y-6">
						<div>
							<label className="mt-1">Shuffle Answers&nbsp;</label>
							<input
								type="checkbox"
								checked={shuffleAnswers}
								onChange={(e) => setShuffleAnswers(e.target.checked)}
							/>
						</div>

						<div className="mt-2">
							<label>Time Limit:</label>
							<div className="flex items-center space-x-2">
								<input
									type="number"
									value={timeLimit}
									onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
									className="px-3 py-2 border border-gray-300 rounded"
									min="1"
									placeholder="10"
								/>
								<span className="text-sm text-gray-500">&nbsp;minutes</span>
							</div>
						</div>

						<div className="mt-2">
							<label>Multiple Attempts&nbsp;</label>
							<input
								type="checkbox"
								checked={multipleAttempts}
								onChange={(e) => setMultipleAttempts(e.target.checked)}
							/>
						</div>

						<div className="mt-2">
							<label>Number of Attempts&nbsp;</label>
							<input
								type="number"
								value={numberOfAttempts}
								onChange={(e) =>
									setNumberOfAttempts(parseInt(e.target.value) || 1)
								}
								disabled={!multipleAttempts}
								className={`px-3 py-2 border border-gray-300 rounded ${
									!multipleAttempts ? 'bg-gray-100 text-gray-400' : ''
								}`}
								min="1"
								placeholder="1"
							/>
						</div>

						<div className="mt-2">
							<label>Show Correct Answers&nbsp;</label>
							<select
								value={showCorrectAnswers}
								onChange={(e) => setShowCorrectAnswers(e.target.value)}
								className="px-3 py-2 border border-gray-300 rounded"
							>
								<option value="immediately">Immediately</option>
								<option value="after_due_date">After due date</option>
								<option value="never">Never</option>
								<option value="after_last_attempt">After last attempt</option>
							</select>
						</div>

						<div className="mt-2">
							<label>Access Code&nbsp;</label>
							<input
								type="text"
								value={accessCode}
								onChange={(e) => setAccessCode(e.target.value)}
								className="px-3 py-2 border border-gray-300 rounded"
								placeholder="Optional passcode"
							/>
						</div>

						<div className="mt-2">
							<label>One Question at a Time&nbsp;</label>
							<input
								type="checkbox"
								checked={oneQuestionAtTime}
								onChange={(e) => setOneQuestionAtTime(e.target.checked)}
							/>
						</div>

						<div className="mt-2">
							<label>Webcam Required&nbsp;</label>
							<input
								type="checkbox"
								checked={webcamRequired}
								onChange={(e) => setWebcamRequired(e.target.checked)}
							/>
						</div>

						<div className="mt-2">
							<label>Lock Questions After Answering&nbsp;</label>
							<input
								type="checkbox"
								checked={lockQuestionsAfterAnswering}
								onChange={(e) =>
									setLockQuestionsAfterAnswering(e.target.checked)
								}
							/>
						</div>
					</div>
				</div>

				<div className="px-4 py-6 flex">
					<div className="mt-2">
						<h5>Assign</h5>
					</div>
					<div className="flex-1 ml-4">
						<div className="border border-gray-300 rounded-3 p-3">
							<div>
								<label htmlFor="wd-due-date" className="mb-1">
									Due Date
								</label>
								<input
									id="wd-due-date"
									type="datetime-local"
									value={
										dueDate instanceof Date
											? dueDate.toISOString().slice(0, 16)
											: dueDate
									}
									onChange={(e) => setDueDate(e.target.value)}
									className="px-3 py-2 border border-gray-300 rounded"
								/>
							</div>
							<div>
								<div>
									<label htmlFor="wd-available-from" className="mb-1">
										Available Date
									</label>
									<input
										id="wd-available-from"
										type="datetime-local"
										value={
											availableDate instanceof Date
												? availableDate.toISOString().slice(0, 16)
												: availableDate
										}
										onChange={(e) => setAvailableDate(e.target.value)}
										className="mt-2 px-3 py-2 border border-gray-300 rounded"
									/>
								</div>
								<div>
									<label htmlFor="wd-available-until" className="mb-1">
										Until Date
									</label>
									<input
										id="wd-available-until"
										type="datetime-local"
										value={
											availableUntil instanceof Date
												? availableUntil.toISOString().slice(0, 16)
												: availableUntil
										}
										onChange={(e) => setAvailableUntil(e.target.value)}
										className="mt-2 px-3 py-2 border border-gray-300 rounded"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderQuestionsTab = () => {
		const totalPoints = questions.reduce(
			(sum: number, q: Question) => sum + (q.points || 0),
			0,
		);

		return (
			<div className="px-4 py-6">
				{questions.length > 0 && (
					<div className="mt-4 p-3 bg-light rounded">
						<div className="row text-center">
							<div className="col">
								<strong>{questions.length}</strong>
								<div className="small text-muted">Questions</div>
							</div>
							<div className="col">
								<strong>{totalPoints}</strong>
								<div className="small text-muted">Total Points</div>
							</div>
						</div>
					</div>
				)}
				{questions.length === 0 ? (
					<div className="text-center text-muted py-5">
						<p>No questions have been added yet.</p>
						<p className="small">Click "New Question" to get started.</p>
					</div>
				) : (
					<ul className="list-unstyled">
						{questions.map((question: Question, index: number) => (
							<li
								key={question.id}
								className="d-flex align-items-center justify-content-between py-3 border-top"
							>
								<div className="d-flex align-items-center flex-grow-1">
									<div className="me-3">
										<span className="badge bg-primary me-2">Q{index + 1}</span>
										<a
											onClick={() =>
												navigate(
													`/CV/Courses/${cid}/Quizzes/${qid}/Questions/Editor/${question.id}`,
												)
											}
											className="text-decoration-none fw-bold"
											style={{ cursor: 'pointer' }}
										>
											{question.title || `Question ${index + 1}`}
										</a>
									</div>
									<div className="d-flex align-items-center gap-2 ms-auto me-3">
										<span className="badge bg-secondary small">
											{question.question_type === 'multiple_choice'
												? 'Multiple Choice'
												: question.question_type === 'true_false'
													? 'True/False'
													: question.question_type === 'fill_in_blank'
														? 'Fill in Blank'
														: question.question_type}
										</span>
										<span className="badge bg-success">
											{question.points || 0} pts
										</span>
									</div>
								</div>
								<div className="d-flex align-items-center">
									<button
										type="button"
										onClick={() =>
											navigate(
												`/CV/Courses/${cid}/Quizzes/${qid}/Questions/Editor/${question.id}`,
											)
										}
										className="px-2 py-1 bg-transparent border-0 rounded-1 me-1"
										title="Edit question"
									>
										<BsPencil size={14} />
									</button>
									<button
										type="button"
										onClick={() => {
											if (
												window.confirm(
													'Are you sure you want to delete this question?',
												)
											) {
												deleteQuestion(question.id);
											}
										}}
										className="px-2 py-1 bg-transparent border-0 rounded-1"
										title="Delete question"
									>
										<BsTrash size={14} />
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
				<div className="d-flex justify-content-center mb-4">
					<button
						type="button"
						onClick={() =>
							navigate(`/CV/Courses/${cid}/Quizzes/${qid}/Questions/Editor`)
						}
						className="px-4 py-2 bg-secondary-subtle border-0 rounded-1"
					>
						<span className="d-flex align-items-center">
							<BsPlus className="fs-4" /> New Question
						</span>
					</button>
				</div>
			</div>
		);
	};

	return (
		<div className="px-8 py-6">
			<div className="bg-white border border-gray-200 rounded-lg">
				<div className="bg-gray-50 px-4 pt-4 border-b border-gray-300">
					<nav className="flex space-x-1">
						<button
							onClick={() => setActiveTab('details')}
							className={`px-4 py-2 text-sm font-medium rounded-t-lg border border-gray-300 ${
								activeTab === 'details'
									? 'bg-white text-gray-900 border border-gray-300 border-b-0'
									: 'bg-gray-200 text-gray-600 border border-transparent'
							}`}
						>
							Details
						</button>
						<button
							onClick={() => {
								setActiveTab('questions');
								if (qid) {
									fetchQuestions();
								}
							}}
							className={`px-4 py-2 text-sm font-medium rounded-t-lg border border-gray-300 ${
								activeTab === 'questions'
									? 'bg-white text-gray-900 border border-gray-300 border-b-0'
									: 'bg-gray-200 text-gray-600 border border-transparent'
							}`}
						>
							Questions
						</button>
					</nav>
				</div>

				{activeTab === 'details' && renderDetailsTab()}
				{activeTab === 'questions' && renderQuestionsTab()}

				<hr className="mt-4 border-gray-300 my-0" />
				<div className="px-4 py-3 border-t border-gray-200">
					<button
						type="button"
						onClick={handleSave}
						className="px-4 py-2 btn btn-danger border-0"
					>
						Save
					</button>
					<button
						type="button"
						onClick={handleSaveAndPublish}
						className="px-4 py-2 btn btn-success border-0 mx-2"
					>
						Save & Publish
					</button>
					<button
						type="button"
						onClick={() => navigate(`/CV/Courses/${cid}/Quizzes`)}
						className="px-4 py-2 btn btn-secondary border-0"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
