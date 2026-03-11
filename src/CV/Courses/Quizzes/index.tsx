import { useEffect, useState } from 'react';
import { Dropdown, ListGroup } from 'react-bootstrap';
import { BsGripVertical, BsPlus } from 'react-icons/bs';
import { FaBan, FaCaretDown, FaSearch } from 'react-icons/fa';
import { IoEllipsisVertical } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FacultyGated, isStudent } from '../../Account/ProtectedRoute';
import type { RootState } from '../../store';
import * as coursesClient from '../client';
import GreenCheckmark from '../Modules/GreenCheckmark';
import * as quizzesClient from './client';
import { deleteQuiz, editQuiz, setQuizzes } from './reducer';

function formatDate(date: string | Date) {
	const parsed = new Date(date);
	const month = parsed.toLocaleString('en-US', { month: 'short' });
	const day = parsed.getDate();
	const time = parsed.toLocaleString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});
	return `${month} ${day} at ${time}`;
}

export default function Quizzes() {
	const { cid } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { quizzes } = useSelector((state: RootState) => state.quizzesReducer);
	const { currentUser } = useSelector(
		(state: RootState) => state.accountReducer,
	);
	const [quizQuestions, setQuizQuestions] = useState<{
		[key: string]: Question[];
	}>();
	const [quizSubmissions, setQuizSubmissions] = useState<{
		[key: string]: Submission[];
	}>();
	const student = isStudent();

	const sortQuizzes = (key: 'title' | 'due_date' | 'available_date') => {
		const sorted = [...quizzes].sort((a, b) => {
			if (key === 'title') return a.title.localeCompare(b.title);
			if (key === 'due_date')
				return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
			if (key === 'available_date')
				return (
					new Date(a.available_date).getTime() -
					new Date(b.available_date).getTime()
				);
			return 0;
		});
		dispatch(setQuizzes(sorted));
	};

	const fetchQuestionsForQuiz = async (quizId: string) => {
		try {
			const questions = await quizzesClient.findQuestionsForQuiz(quizId);
			setQuizQuestions((prev) => ({ ...prev, [quizId]: questions }));
		} catch (error) {
			console.error('Error fetching questions for quiz:', quizId, error);
		}
	};

	const fetchSubmissionsForQuiz = async (quizId: string) => {
		if (!student || !currentUser || !currentUser.id) return;

		try {
			const submissions = await quizzesClient.findSubmissionsForQuiz(
				quizId,
				currentUser.id,
			);
			setQuizSubmissions((prev) => ({ ...prev, [quizId]: submissions }));
		} catch (error) {
			console.error('Error fetching submissions for quiz:', quizId, error);
			setQuizSubmissions((prev) => ({ ...prev, [quizId]: [] }));
		}
	};

	const getMostRecentScore = (quizId: string) => {
		if (!quizSubmissions)
			throw new Error(
				'Error retrieving most recent score. Quiz submissions not found.',
			);

		const submissions = quizSubmissions[quizId] || [];

		const completedSubmissions = submissions.filter(
			(sub) => sub.status !== 'in_progress',
		);

		if (completedSubmissions.length === 0) return null;

		const sortedSubmissions = completedSubmissions.sort((a, b) => {
			const dateA = new Date(a.submitted_at || a.started_at);
			const dateB = new Date(b.submitted_at || b.started_at);
			return dateB.getTime() - dateA.getTime();
		});

		const mostRecent = sortedSubmissions[0];
		const result = {
			score: mostRecent.total_score,
			maxScore: mostRecent.max_possible_score,
			percentage: Math.round(mostRecent.percentage),
		};
		return result;
	};

	function getQuizInfoText(quiz: Quiz) {
		const now = new Date();
		const availableDate = new Date(quiz.available_date);
		const availableUntil = new Date(quiz.available_until);
		const availableDateStr = formatDate(quiz.available_date);

		let availability = '';
		if (now < availableDate) {
			availability = `<strong>Not available until</strong> ${availableDateStr}`;
		} else if (now > availableUntil) {
			availability = `<strong>Closed</strong>`;
		} else {
			availability = `<strong>Available</strong>`;
		}

		const due = `<strong>Due</strong> ${formatDate(quiz.due_date)}`;

		const questions = quizQuestions?.[quiz.id] || [];
		const totalPoints = questions.reduce(
			(sum: number, q: Question) => sum + (q.points || 0),
			0,
		);
		const points = `${totalPoints} ${totalPoints === 1 ? 'pt' : 'pts'}`;
		const numQuestions = `${questions.length} ${questions.length === 1 ? 'Question' : 'Questions'}`;

		let items;
		if (student) {
			const recentScore = getMostRecentScore(quiz.id);
			const score = recentScore
				? `<strong>Score:</strong> ${recentScore.score}`
				: '<strong>Score:</strong> Not attempted';
			items = [availability, due, points, numQuestions, score].filter(Boolean);
		} else {
			items = [availability, due, points, numQuestions].filter(Boolean);
		}

		return items.join(' | ');
	}

	const removeQuiz = async (quizId: string) => {
		await quizzesClient.deleteQuiz(quizId);
		dispatch(deleteQuiz(quizId));
	};

	const togglePublish = async (quiz: Quiz) => {
		const updatedQuiz = { ...quiz, published: !quiz.published };
		await quizzesClient.updateQuiz(updatedQuiz);
		dispatch(editQuiz(updatedQuiz));
	};

	const fetchQuizzes = async () => {
		try {
			const allQuizzes = await coursesClient.findQuizzesForCourse(
				cid as string,
			);
			const filteredQuizzes = student
				? allQuizzes.filter((quiz: Quiz) => quiz.published)
				: allQuizzes;

			dispatch(setQuizzes(filteredQuizzes));

			for (const quiz of filteredQuizzes) {
				await fetchQuestionsForQuiz(quiz.id);
				if (student && currentUser) {
					await fetchSubmissionsForQuiz(quiz.id);
				}
			}
		} catch (error) {
			console.error('Error in fetchQuizzes:', error);
		}
	};
	useEffect(() => {
		fetchQuizzes();
	}, [cid, currentUser]);

	function handleDelete(id: string) {
		if (window.confirm('Are you sure you want to remove this quiz?')) {
			removeQuiz(id);
		}
	}

	return (
		<div id="wd-quizzes">
			<div className="mb-3 d-flex justify-content-between align-items-center">
				<div className="position-relative">
					<FaSearch
						className="position-absolute text-muted"
						style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}
					/>
					<input
						placeholder="Search for Quiz"
						id="wd-search-quiz"
						className="form-control"
						style={{ paddingLeft: '35px' }}
					/>
				</div>

				<div>
					<FacultyGated>
						<div className="d-flex align-items-center">
							<button
								id="wd-add-quiz"
								className="btn btn-danger border border-gray"
								onClick={() => navigate(`/CV/Courses/${cid}/Quizzes/new`)}
							>
								<span className="d-flex align-items-center">
									<BsPlus className="fs-4" /> Quiz
								</span>
							</button>

							<Dropdown className="d-inline ms-2">
								<Dropdown.Toggle
									variant="link"
									className="text-dark p-0 border border-secondary bg-secondary-subtle d-flex align-items-center justify-content-center"
									bsPrefix="dropdown-toggle-no-caret"
									style={{ width: '38px', height: '38px' }}
								>
									<IoEllipsisVertical className="fs-4" />
								</Dropdown.Toggle>
								<Dropdown.Menu>
									<Dropdown.Item onClick={() => sortQuizzes('title')}>
										Sort by Name
									</Dropdown.Item>
									<Dropdown.Item onClick={() => sortQuizzes('due_date')}>
										Sort by Due Date
									</Dropdown.Item>
									<Dropdown.Item onClick={() => sortQuizzes('available_date')}>
										Sort by Available Date
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						</div>
					</FacultyGated>
				</div>
			</div>

			<ListGroup id="wd-quiz-list" className="rounded-0">
				<ListGroup.Item className="wd-quiz-group p-0 mb-5 fs-5 border-gray">
					<div className="wd-title p-3 ps-2 bg-secondary-subtle d-flex align-items-center">
						<FaCaretDown className="me-2" />
						Assignment Quizzes
					</div>

					{quizzes.length > 0 && (
						<ListGroup className="wd-quizzes rounded-0">
							{quizzes.map((quiz: Quiz) => (
								<ListGroup.Item
									key={quiz.id}
									className="wd-quiz p-3 ps-1 border-0 border-start border-3 border-success"
								>
									<div className="d-flex justify-content-between align-items-center">
										<div className="d-flex align-items-center">
											<BsGripVertical className="me-3 fs-3" />
											<div>
												<strong>
													{!student ? (
														<button
															className="btn btn-link p-0 text-decoration-none text-dark fw-bold"
															onClick={() =>
																navigate(
																	`/CV/Courses/${cid}/Quizzes/${quiz.id}`,
																)
															}
															style={{ border: 'none', background: 'none' }}
														>
															{quiz.title}
														</button>
													) : (
														<button
															className="btn btn-link p-0 text-decoration-none text-dark fw-bold"
															onClick={() =>
																navigate(
																	`/CV/Courses/${cid}/Quizzes/${quiz.id}/submission`,
																)
															}
															style={{ border: 'none', background: 'none' }}
														>
															{quiz.title}
														</button>
													)}
												</strong>
												<div
													className="text-muted small mt-1"
													dangerouslySetInnerHTML={{
														__html: getQuizInfoText(quiz),
													}}
												></div>
											</div>
										</div>

										<FacultyGated>
											<div className="d-flex align-items-center">
												{quiz.published ? (
													<GreenCheckmark />
												) : (
													<span className="me-1 d-inline-flex align-items-center">
														<FaBan className="text-danger fs-5" />
													</span>
												)}
												<Dropdown className="d-inline ms-3">
													<Dropdown.Toggle
														variant="link"
														className="text-dark p-0 border-0 bg-transparent d-flex align-items-center"
														bsPrefix="dropdown-toggle-no-caret"
													>
														<IoEllipsisVertical />
													</Dropdown.Toggle>
													<Dropdown.Menu>
														<Dropdown.Item
															onClick={() =>
																navigate(
																	`/CV/Courses/${cid}/Quizzes/${quiz.id}`,
																)
															}
														>
															Edit
														</Dropdown.Item>
														<Dropdown.Item
															onClick={() => handleDelete(quiz.id)}
														>
															Delete
														</Dropdown.Item>
														<Dropdown.Item onClick={() => togglePublish(quiz)}>
															{quiz.published ? 'Unpublish' : 'Publish'}
														</Dropdown.Item>
													</Dropdown.Menu>
												</Dropdown>
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
