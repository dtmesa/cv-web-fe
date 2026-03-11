import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, Modal, ProgressBar } from 'react-bootstrap';
import {
	BsArrowLeft,
	BsArrowRight,
	BsClock,
	BsEyeFill,
	BsLock,
} from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import type { RootState } from '../../store';
import * as quizzesClient from './client';
import * as submissionsClient from './Submissions/client';
import { addSubmission, editSubmission } from './Submissions/reducer';

export default function QuizSubmission() {
	const { cid, qid } = useParams();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { quizzes } = useSelector((state: RootState) => state.quizzesReducer);
	const { currentUser } = useSelector(
		(state: RootState) => state.accountReducer,
	);

	const [quiz, setQuiz] = useState<Quiz>();
	const [questions, setQuestions] = useState<any[]>([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<{ [key: string]: string }>({});
	const [timeRemaining, setTimeRemaining] = useState(0);
	const [isTimerActive, setIsTimerActive] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [showAllResults, setShowAllResults] = useState(false);
	const [quizStarted, setQuizStarted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [startTime, setStartTime] = useState<Date>();
	const [submission, setSubmission] = useState<Submission>();
	const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
	const [submissionCount, setSubmissionCount] = useState(0);
	const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);
	const [accessCodeInput, setAccessCodeInput] = useState('');
	const [accessCodeError, setAccessCodeError] = useState('');

	const timerRef = useRef<number>(null);

	useEffect(() => {
		loadQuizData();
	}, [qid]);

	useEffect(() => {
		if (isTimerActive && timeRemaining > 0) {
			timerRef.current = setInterval(() => {
				setTimeRemaining((prev) => {
					if (prev <= 1) {
						handleTimeUp();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		} else {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [isTimerActive, timeRemaining]);

	const isQuizClosed = () => {
		if (!quiz)
			throw new Error('Error determining if quiz is closed. Quiz not found.');
		if (!quiz.available_until) return false;
		const now = new Date();
		const availableUntil = new Date(quiz.available_until);
		return now > availableUntil;
	};

	const loadQuizData = async () => {
		try {
			const foundQuiz = quizzes.find((q: Quiz) => q.id === qid);
			if (!foundQuiz) {
				navigate(`/CV/Courses/${cid}/Quizzes`);
				return;
			}

			setQuiz(foundQuiz);

			if (!currentUser || !currentUser.id)
				throw new Error(
					'Error loading quiz data. Failed to load currrent user.',
				);

			const fetchedUserSubmissions = await quizzesClient.findSubmissionsForQuiz(
				qid!,
				currentUser.id,
			);
			setSubmissionCount(fetchedUserSubmissions.length);
			setUserSubmissions(fetchedUserSubmissions);

			const fetchedQuestions = await quizzesClient.findQuestionsForQuiz(qid!);
			let processedQuestions = [...fetchedQuestions];

			if (foundQuiz.shuffle_answers) {
				processedQuestions = shuffleArray(processedQuestions);

				processedQuestions = processedQuestions.map((question) => {
					if (
						question.question_type === 'multiple_choice' &&
						question.choices
					) {
						return {
							...question,
							choices: shuffleArray([...question.choices]),
						};
					}
					return question;
				});
			}

			setQuestions(processedQuestions);
			setTimeRemaining(foundQuiz.time_limit * 60);

			setIsLoading(false);
		} catch (error) {
			console.error('Error loading quiz:', error);
			setIsLoading(false);
		}
	};

	const handleStartQuiz = () => {
		if (!quiz) throw new Error('Error starting quiz. Quiz not found.');
		if (quiz.access_code && quiz.access_code.trim() !== '') {
			setShowAccessCodeModal(true);
		} else {
			startQuiz();
		}
	};

	const handleAccessCodeSubmit = () => {
		if (!quiz || !quiz.access_code)
			throw new Error('Error submitting access code. Quiz not found.');

		if (!accessCodeInput.trim()) {
			setAccessCodeError('Please enter an access code');
			return;
		}

		if (accessCodeInput.trim() !== quiz.access_code.trim()) {
			setAccessCodeError('Incorrect access code. Please try again.');
			return;
		}

		setShowAccessCodeModal(false);
		setAccessCodeInput('');
		setAccessCodeError('');
		startQuiz();
	};

	const handleAccessCodeCancel = () => {
		setShowAccessCodeModal(false);
		setAccessCodeInput('');
		setAccessCodeError('');
	};

	const getMostRecentSubmission = () => {
		if (userSubmissions.length === 0) return null;

		const completedSubmissions = userSubmissions.filter(
			(sub) => sub.status !== 'in_progress',
		);
		if (completedSubmissions.length === 0) return null;

		const sortedSubmissions = [...completedSubmissions].sort((a, b) => {
			const dateA = new Date(a.submitted_at || a.started_at);
			const dateB = new Date(b.submitted_at || b.started_at);
			return dateB.getTime() - dateA.getTime();
		});

		return sortedSubmissions[0];
	};

	const renderMostRecentSubmission = () => {
		const mostRecentSubmission = getMostRecentSubmission();

		if (!mostRecentSubmission) {
			return (
				<div className="container mt-4">
					<Alert variant="info">
						<h5>No Previous Submissions</h5>
						<p>You haven't completed this quiz yet.</p>
					</Alert>
					<Button variant="secondary" onClick={() => setShowAllResults(false)}>
						Back to Quiz
					</Button>
				</div>
			);
		}

		return (
			<div className="container mt-4">
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h3>Previous Results</h3>
					<Button variant="secondary" onClick={() => setShowAllResults(false)}>
						Back to Quiz
					</Button>
				</div>

				<div className="card mb-4">
					<div className="card-header">
						<div className="d-flex justify-content-between align-items-center">
							<h5 className="mb-0">
								Attempt #{mostRecentSubmission.attempt_number}
							</h5>
							<div className="text-muted">
								{mostRecentSubmission.submitted_at
									? new Date(mostRecentSubmission.submitted_at).toLocaleString()
									: new Date(mostRecentSubmission.started_at).toLocaleString()}
							</div>
						</div>
					</div>
					<div className="card-body">
						<Alert>
							<div className="row">
								<div className="col-md-4">
									<strong>Score:</strong> {mostRecentSubmission.total_score}/
									{mostRecentSubmission.max_possible_score}
								</div>
								<div className="col-md-4">
									<strong>Percentage:</strong>{' '}
									{Math.round(mostRecentSubmission.percentage)}%
								</div>
								<div className="col-md-4">
									<strong>Time Taken:</strong>{' '}
									{mostRecentSubmission.time_taken
										? formatTime(mostRecentSubmission.time_taken)
										: 'N/A'}
								</div>
							</div>
						</Alert>

						{mostRecentSubmission.answers &&
							mostRecentSubmission.answers.length > 0 && (
								<div className="mt-4">
									<h5>Your Answers</h5>
									{questions.map((question, qIndex) => {
										const submissionAnswer = mostRecentSubmission.answers.find(
											(a) => a.question === question.id,
										);
										const isCorrect = submissionAnswer?.is_correct || false;

										let userAnswer = '';
										if (submissionAnswer?.selected_choice) {
											userAnswer = submissionAnswer.selected_choice;
										} else if (submissionAnswer?.boolean_answer !== undefined) {
											userAnswer = submissionAnswer.boolean_answer
												? 'True'
												: 'False';
										} else if (submissionAnswer?.text_answer) {
											userAnswer = submissionAnswer.text_answer;
										} else {
											userAnswer = 'No answer provided';
										}

										return (
											<div
												key={question.id}
												className={`border rounded p-3 mb-3 ${isCorrect ? 'border-success' : 'border-danger'}`}
											>
												<div className="d-flex justify-content-between align-items-start mb-3">
													<div className="flex-grow-1">
														<h6 className="mb-2">Question {qIndex + 1}</h6>
														<div
															dangerouslySetInnerHTML={{
																__html: question.question,
															}}
														/>
													</div>
													<span
														className={`badge ${isCorrect ? 'bg-success' : 'bg-danger'} ms-3`}
													>
														{isCorrect ? 'Correct' : 'Incorrect'} (
														{submissionAnswer?.points_earned || 0}/
														{submissionAnswer?.max_points || 0} pts)
													</span>
												</div>

												<div className="mt-3 p-2 bg-light rounded">
													<strong>Your Answer: </strong>
													<span
														className={
															isCorrect ? 'text-success fw-bold' : 'text-danger'
														}
													>
														{userAnswer}
													</span>
												</div>
											</div>
										);
									})}
								</div>
							)}
					</div>
				</div>
			</div>
		);
	};

	const shuffleArray = (array: Question[]) => {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	};

	const startQuiz = async () => {
		if (!currentUser)
			throw new Error('Error starting quiz. Current user not found.');

		const now = new Date();
		setStartTime(now);
		setQuizStarted(true);
		setIsTimerActive(true);

		const maxScore = questions.reduce((sum, q) => sum + (q.points || 0), 0);
		const initialSubmission: Submission = {
			quiz: qid!,
			user: currentUser.id!,
			attempt_number: submissionCount + 1,
			status: 'in_progress',
			total_score: 0,
			max_possible_score: maxScore,
			percentage: 0,
			started_at: now,
			answers: [],
		};

		try {
			const createdSubmission = await quizzesClient.createSubmission(
				qid!,
				initialSubmission,
			);
			setSubmission(createdSubmission);
			dispatch(addSubmission(createdSubmission));
		} catch (error) {
			console.error('Error creating submission:', error);
			alert('Error starting quiz. Please try again.');
		}
	};

	const handleAnswerChange = (questionId: string, answer: string) => {
		setAnswers((prev) => ({
			...prev,
			[questionId]: answer,
		}));
	};

	const getCurrentAnswer = (questionId: string) => {
		if (!answers)
			throw new Error('Error retrieving current answer. Answers not found.');

		return answers[questionId];
	};

	const goToQuestion = (index: number) => {
		if (!quiz) throw new Error('Error locating question. Failed to load quiz.');

		if (quiz.one_question_at_a_time && quiz.lock_questions_after_answering) {
			const currentQuestion = questions[currentQuestionIndex];
			const currentAnswer = getCurrentAnswer(currentQuestion.id);
			if (!currentAnswer) {
				alert('Please answer the current question before proceeding.');
				return;
			}
		}

		setCurrentQuestionIndex(index);
	};

	const handleTimeUp = () => {
		setIsTimerActive(false);
		alert('Time has run out; your quiz has been automatically submitted.');
		submitQuiz('auto_submitted');
	};

	const submitQuiz = async (
		status: 'submitted' | 'auto_submitted' = 'submitted',
	) => {
		setIsTimerActive(false);

		if (!submission) {
			alert('Error: No submission found');
			return;
		}

		try {
			const submissionAnswers = buildSubmissionAnswers();
			const totalScore = submissionAnswers.reduce(
				(sum, a) => sum + a.points_earned,
				0,
			);
			const percentage = (totalScore / submission.max_possible_score) * 100;
			const timeTaken = startTime
				? Math.floor((Date.now() - startTime.getTime()) / 1000)
				: 0;

			const finalSubmission = {
				...submission,
				status,
				total_score: totalScore,
				percentage,
				submitted_at: new Date(),
				time_taken: timeTaken,
				answers: submissionAnswers,
			};

			await submissionsClient.updateSubmission(qid!, finalSubmission);
			setSubmission(finalSubmission);
			dispatch(editSubmission(finalSubmission));
			setShowResults(true);
		} catch (error) {
			console.error('Error submitting quiz:', error);
			alert('Error submitting quiz. Please try again.');
		}
	};

	const buildSubmissionAnswers = (): SubmissionAnswer[] => {
		if (!answers)
			throw new Error('Error building submission answers. Answers not found.');
		return questions.map((question) => {
			const userAnswer = answers[question.id];
			const maxPoints = question.points || 0;
			let isCorrect = false;
			let pointsEarned = 0;

			if (
				question.question_type === 'multiple_choice' ||
				question.question_type === 'true_false'
			) {
				const selectedChoice = question.choices?.find(
					(choice: Choice) => choice.text === userAnswer,
				);
				isCorrect = selectedChoice?.is_correct || false;
			} else if (question.question_type === 'fill_in_blank') {
				const correctAnswers = question.possible_answers || [];
				isCorrect = correctAnswers.some(
					(correctAnswer: string) =>
						correctAnswer.toLowerCase().trim() ===
						String(userAnswer || '')
							.toLowerCase()
							.trim(),
				);
			}

			if (isCorrect) {
				pointsEarned = maxPoints;
			}

			const answer: SubmissionAnswer = {
				question: question.id,
				max_points: maxPoints,
				points_earned: pointsEarned,
				is_correct: isCorrect,
			};

			if (question.question_type === 'multiple_choice') {
				answer.selected_choice = userAnswer;
			} else if (question.question_type === 'true_false') {
				answer.boolean_answer = userAnswer === 'True';
			} else if (question.question_type === 'fill_in_blank') {
				answer.text_answer = userAnswer || '';
			}

			return answer;
		});
	};

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	const renderQuestion = (question: any) => {
		const currentAnswer = getCurrentAnswer(question.id);

		switch (question.question_type) {
			case 'multiple_choice':
				return (
					<div className="mb-4">
						{question.choices.map((choice: any, index: number) => (
							<div key={index} className="form-check mb-2">
								<input
									className="form-check-input"
									type="radio"
									name={`question-${question.id}`}
									id={`choice-${question.id}-${index}`}
									checked={currentAnswer === choice.text}
									onChange={() => handleAnswerChange(question.id, choice.text)}
								/>
								<label
									className="form-check-label"
									htmlFor={`choice-${question.id}-${index}`}
								>
									{choice.text}
								</label>
							</div>
						))}
					</div>
				);

			case 'true_false':
				return (
					<div className="mb-4">
						{question.choices.map((choice: any, index: number) => (
							<div key={index} className="form-check mb-2">
								<input
									className="form-check-input"
									type="radio"
									name={`question-${question.id}`}
									id={`choice-${question.id}-${index}`}
									checked={currentAnswer === choice.text}
									onChange={() => handleAnswerChange(question.id, choice.text)}
								/>
								<label
									className="form-check-label"
									htmlFor={`choice-${question.id}-${index}`}
								>
									{choice.text}
								</label>
							</div>
						))}
					</div>
				);

			case 'fill_in_blank':
				return (
					<div className="mb-4">
						<input
							type="text"
							className="form-control"
							placeholder="Enter your answer"
							value={currentAnswer}
							onChange={(e) => handleAnswerChange(question.id, e.target.value)}
						/>
					</div>
				);

			default:
				return <div>Unsupported question type</div>;
		}
	};

	const renderResults = () => {
		if (!submission) return null;
		if (!quiz) throw new Error('Error rendering results. Quiz not found.');

		const canShowCorrectAnswers =
			quiz.show_correct_answers === 'immediately' ||
			(quiz.show_correct_answers === 'after_due_date' &&
				new Date() > new Date(quiz.due_date)) ||
			quiz.show_correct_answers === 'after_last_attempt';

		return (
			<div className="results-container">
				<Alert>
					<h5>Results</h5>
					<p>
						<strong>Score:</strong> {submission.total_score}/
						{submission.max_possible_score} ({Math.round(submission.percentage)}
						%)
					</p>
					<p>
						<strong>Time Taken:</strong>{' '}
						{submission.time_taken ? formatTime(submission.time_taken) : 'N/A'}
					</p>
				</Alert>

				{canShowCorrectAnswers && (
					<div className="mt-4">
						<h5>Review Answers</h5>
						{questions.map((question, index) => {
							const submissionAnswer = submission.answers.find(
								(a) => a.question === question.id,
							);
							const isCorrect = submissionAnswer?.is_correct || false;

							return (
								<div
									key={question.id}
									className={`border rounded p-3 mb-3 ${isCorrect ? 'border-success' : 'border-danger'}`}
								>
									<div className="d-flex justify-content-between">
										<h6>
											Question {index + 1}: {question.title}
										</h6>
										<span
											className={`badge ${isCorrect ? 'bg-success' : 'bg-danger'}`}
										>
											{isCorrect ? 'Correct' : 'Incorrect'} (
											{submissionAnswer?.points_earned || 0} pts)
										</span>
									</div>
									<div
										dangerouslySetInnerHTML={{ __html: question.question }}
									/>
									<div className="mt-2">
										<strong>Your answer:</strong>{' '}
										{submissionAnswer?.selected_choice ||
											(submissionAnswer?.boolean_answer !== undefined
												? submissionAnswer.boolean_answer
													? 'True'
													: 'False'
												: '') ||
											submissionAnswer?.text_answer ||
											'No answer'}
									</div>
									{!isCorrect && (
										<div className="mt-1">
											<strong>Correct answer:</strong>
											{question.question_type === 'fill_in_blank'
												? question.possible_answers?.join(', ')
												: question.choices?.find((c: any) => c.is_correct)
														?.text}
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		);
	};

	if (isLoading) {
		return (
			<div className="d-flex justify-content-center p-5">Loading quiz...</div>
		);
	}

	if (showAllResults) {
		return renderMostRecentSubmission();
	}

	if (showResults) {
		return (
			<div className="container mt-4">
				{renderResults()}
				<div className="d-flex justify-content-between mt-4">
					<Button
						variant="secondary"
						onClick={() => navigate(`/CV/Courses/${cid}/Quizzes`)}
					>
						Return to Quizzes
					</Button>
				</div>
			</div>
		);
	}

	if (!quiz) return <div>Loading quiz...</div>;

	if (!quizStarted) {
		return (
			<div className="container mt-4">
				<div className="row justify-content-center">
					<div className="col-md-8">
						<div className="card">
							<div className="card-header">
								<h3>{quiz.title}</h3>
							</div>
							<div className="card-body">
								<div dangerouslySetInnerHTML={{ __html: quiz.description }} />

								<div className="quiz-info mt-4">
									<div className="row">
										<div className="col-sm-6">
											<p>
												<strong>Questions:</strong> {questions.length}
											</p>
											<p>
												<strong>Time Limit:</strong> {quiz.time_limit} minutes
											</p>
											<p>
												<strong>Attempts:</strong>{' '}
												{quiz.multiple_attempts
													? `Up to ${quiz.number_of_attempts}`
													: '1'}
											</p>
											<p>
												<strong>Current Attempts:</strong> {submissionCount}
											</p>
											{quiz.due_date && (
												<p>
													<strong>Due:</strong>{' '}
													{new Date(quiz.due_date).toLocaleString()}
												</p>
											)}
										</div>
										<div className="col-sm-6">
											<p>
												<strong>Points:</strong>{' '}
												{questions.reduce((sum, q) => sum + (q.points || 0), 0)}
											</p>
											{(() => {
												const mostRecentSubmission = getMostRecentSubmission();
												if (
													mostRecentSubmission &&
													mostRecentSubmission.status !== 'in_progress'
												) {
													return (
														<p>
															<strong>Current Score: </strong>{' '}
															{mostRecentSubmission.total_score}
														</p>
													);
												}
												return null;
											})()}
										</div>
									</div>
								</div>

								{quiz.webcam_required && (
									<Alert variant="warning" className="mt-3">
										<BsEyeFill className="me-2" />
										<strong>Webcam Monitoring Required:</strong> This quiz
										requires webcam monitoring. Please ensure your camera is
										working and allow access when prompted.
									</Alert>
								)}

								<div className="d-flex justify-content-between mt-4">
									<div>
										<Button
											variant="danger"
											onClick={handleStartQuiz}
											disabled={
												isQuizClosed() ||
												(quiz.multiple_attempts &&
													submissionCount >= quiz.number_of_attempts) ||
												(!quiz.multiple_attempts && submissionCount >= 1)
											}
											className="me-2"
										>
											{isQuizClosed()
												? 'Quiz Closed'
												: quiz.multiple_attempts &&
														submissionCount >= quiz.number_of_attempts
													? `All Attempts Used`
													: !quiz.multiple_attempts && submissionCount >= 1
														? 'Quiz Already Completed'
														: 'Start Quiz'}
										</Button>

										{submissionCount > 0 && (
											<Button
												variant="success"
												onClick={() => setShowAllResults(true)}
											>
												View Results
											</Button>
										)}
									</div>

									<Button
										variant="secondary"
										onClick={() => navigate(`/CV/Courses/${cid}/Quizzes`)}
									>
										Back to Quizzes
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Access Code Modal */}
				<Modal
					show={showAccessCodeModal}
					onHide={handleAccessCodeCancel}
					centered
				>
					<Modal.Header closeButton>
						<Modal.Title>
							<BsLock className="me-2" />
							Enter Access Code
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p className="text-muted mb-3">
							This quiz requires an access code.
						</p>
						<Form.Group>
							<Form.Label>Access Code</Form.Label>
							<Form.Control
								type="text"
								value={accessCodeInput}
								onChange={(e) => setAccessCodeInput(e.target.value)}
								placeholder="Enter access code"
								isInvalid={!!accessCodeError}
								onKeyPress={(e) => {
									if (e.key === 'Enter') {
										handleAccessCodeSubmit();
									}
								}}
								autoFocus
							/>
							{accessCodeError && (
								<Form.Control.Feedback type="invalid">
									{accessCodeError}
								</Form.Control.Feedback>
							)}
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={handleAccessCodeCancel}>
							Cancel
						</Button>
						<Button variant="primary" onClick={handleAccessCodeSubmit}>
							Submit
						</Button>
					</Modal.Footer>
				</Modal>
			</div>
		);
	}

	const currentQuestion = questions[currentQuestionIndex];
	const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

	return (
		<div className="container-fluid quiz-taking-interface">
			<div className="quiz-header bg-light border-bottom p-3 sticky-top">
				<div className="row align-items-center">
					<div className="col-md-4 text-center">
						<ProgressBar
							now={progress}
							label={`${currentQuestionIndex + 1}/${questions.length}`}
						/>
					</div>
					<div className="col-md-4 text-end">
						<div className="d-flex flex-column align-items-end">
							{startTime && (
								<div className="text-muted small mb-1">
									Started: {startTime.toLocaleTimeString()}
								</div>
							)}
							<div className="d-flex align-items-center">
								<BsClock className="me-2" />
								<span className={`badge bg-danger fs-6`}>
									{formatTime(timeRemaining)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="quiz-content p-4">
				<div className="row justify-content-center">
					<div className="col-lg-8">
						<div className="question-container">
							<div className="d-flex justify-content-between align-items-start mb-3">
								<h4>Question {currentQuestionIndex + 1}</h4>
							</div>

							<div className="question-content mb-4">
								<div
									dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
								/>
							</div>

							{renderQuestion(currentQuestion)}
						</div>
					</div>
				</div>
			</div>

			<div className="quiz-footer bg-light border-top p-3 sticky-bottom">
				<div className="d-flex justify-content-between align-items-center">
					<div>
						{!quiz.one_question_at_a_time && (
							<div className="question-navigation">
								<span className="me-2">Go to:</span>
								{questions.map((_, index) => {
									const hasAnswer = getCurrentAnswer(questions[index].id);
									return (
										<Button
											key={index}
											variant={
												index === currentQuestionIndex
													? 'primary'
													: hasAnswer
														? 'success'
														: 'outline-secondary'
											}
											size="sm"
											className="me-1 mb-1"
											onClick={() => goToQuestion(index)}
										>
											{index + 1}
										</Button>
									);
								})}
							</div>
						)}
					</div>

					<div className="navigation-buttons">
						<Button
							variant="outline-secondary"
							disabled={currentQuestionIndex === 0}
							onClick={() => goToQuestion(currentQuestionIndex - 1)}
							className="me-2"
						>
							<BsArrowLeft className="me-1" /> Previous
						</Button>

						{currentQuestionIndex < questions.length - 1 ? (
							<Button
								variant="primary"
								onClick={() => goToQuestion(currentQuestionIndex + 1)}
							>
								Next <BsArrowRight className="ms-1" />
							</Button>
						) : (
							<Button
								variant="success"
								onClick={() => {
									if (
										window.confirm('Are you sure you want to submit your quiz?')
									) {
										submitQuiz();
									}
								}}
							>
								Submit Quiz
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
