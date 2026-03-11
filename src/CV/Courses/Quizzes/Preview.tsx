import { useEffect, useRef, useState } from 'react';
import { Alert, Button, ProgressBar } from 'react-bootstrap';
import { BsArrowLeft, BsArrowRight, BsClock, BsEyeFill } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import type { RootState } from '../../store';
import * as quizzesClient from './client';

interface CurrentAnswer {
	questionId: string;
	answer: string | string[];
	isCorrect?: boolean;
}

export default function QuizPreview() {
	const { cid, qid } = useParams();
	const navigate = useNavigate();
	const { quizzes } = useSelector((state: RootState) => state.quizzesReducer);

	const [quiz, setQuiz] = useState<Quiz>();
	const [questions, setQuestions] = useState<Question[]>([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<CurrentAnswer[]>([]);
	const [timeRemaining, setTimeRemaining] = useState(0);
	const [isTimerActive, setIsTimerActive] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [quizStarted, setQuizStarted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [startTime, setStartTime] = useState<Date>();

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

	const loadQuizData = async () => {
		try {
			const foundQuiz = quizzes.find((q: Quiz) => q.id === qid);
			if (!foundQuiz) {
				navigate(`/CV/Courses/${cid}/Quizzes`);
				return;
			}

			setQuiz(foundQuiz);

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

	const shuffleArray = (arr: Question[]) => {
		const shuffled = [...arr];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	};

	const startQuiz = async () => {
		setStartTime(new Date());
		setQuizStarted(true);
		setIsTimerActive(true);
	};

	const handleAnswerChange = (
		questionId: string,
		answer: string | string[],
	) => {
		setAnswers((prev) => {
			const existing = prev.find((a) => a.questionId === questionId);
			if (existing) {
				return prev.map((a) =>
					a.questionId === questionId ? { ...a, answer } : a,
				);
			} else {
				return [...prev, { questionId, answer }];
			}
		});
	};

	const getCurrentAnswer = (questionId: string) => {
		return answers.find((a) => a.questionId === questionId)?.answer || '';
	};

	const goToQuestion = (index: number) => {
		if (!quiz)
			throw new Error('Error navigating to question. Question not found.');

		if (quiz.one_question_at_a_time && quiz.lock_questions_after_answering) {
			const currentQuestion = questions[currentQuestionIndex];
			const currentAnswer = getCurrentAnswer(currentQuestion.id);
			if (
				!currentAnswer ||
				(Array.isArray(currentAnswer) && currentAnswer.length === 0)
			) {
				alert('Please answer the current question before proceeding.');
				return;
			}
		}

		setCurrentQuestionIndex(index);
	};

	const handleTimeUp = () => {
		setIsTimerActive(false);
		alert("Time's up! Your quiz has been automatically submitted.");
		submitQuiz();
	};

	const submitQuiz = () => {
		setIsTimerActive(false);
		calculateResults();
		setShowResults(true);
	};

	const calculateResults = () => {
		const updatedAnswers = answers.map((answer) => {
			const question = questions.find((q) => q.id === answer.questionId);
			if (!question) return answer;

			let isCorrect = false;

			if (
				question.question_type === 'multiple_choice' ||
				question.question_type === 'true_false'
			) {
				const selectedChoice = question.choices.find(
					(choice: Choice) => choice.text === answer.answer,
				);
				isCorrect = selectedChoice?.is_correct || false;
			} else if (question.question_type === 'fill_in_blank') {
				const correctAnswers = question.possible_answers || [];
				isCorrect = correctAnswers.some(
					(correctAnswer: string) =>
						correctAnswer.toLowerCase().trim() ===
						String(answer.answer).toLowerCase().trim(),
				);
			}

			return { ...answer, isCorrect };
		});

		setAnswers(updatedAnswers);
	};

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	const renderQuestion = (question: Question) => {
		const currentAnswer = getCurrentAnswer(question.id);

		switch (question.question_type) {
			case 'multiple_choice':
				return (
					<div className="mb-4">
						{question.choices.map((choice: Choice, index: number) => (
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
						{question.choices.map((choice: Choice, index: number) => (
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
							value={currentAnswer as string}
							onChange={(e) => handleAnswerChange(question.id, e.target.value)}
						/>
					</div>
				);

			default:
				return <div>Unsupported question type</div>;
		}
	};

	const renderResults = () => {
		const totalQuestions = questions.length;
		const correctAnswers = answers.filter((a) => a.isCorrect).length;
		const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
		const earnedPoints = answers
			.filter((a) => a.isCorrect)
			.reduce((sum, a) => {
				const question = questions.find((q) => q.id === a.questionId);
				return sum + (question?.points || 0);
			}, 0);

		const canShowCorrectAnswers =
			quiz &&
			(quiz.show_correct_answers === 'immediately' ||
				(quiz.show_correct_answers === 'after_due_date' &&
					new Date() > new Date(quiz.due_date)) ||
				quiz.show_correct_answers === 'after_last_attempt');

		return (
			<div className="results-container">
				<Alert variant="success">
					<h5>Results</h5>
					<p>
						<strong>Score:</strong> {correctAnswers}/{totalQuestions} (
						{Math.round((correctAnswers / totalQuestions) * 100)}%)
					</p>
					<p>
						<strong>Points:</strong> {earnedPoints}/{totalPoints}
					</p>
				</Alert>

				{canShowCorrectAnswers && (
					<div className="mt-4">
						<h5>Review Answers</h5>
						{questions.map((question, index) => {
							const userAnswer = answers.find(
								(a) => a.questionId === question.id,
							);
							const isCorrect = userAnswer?.isCorrect || false;

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
											{isCorrect ? 'Correct' : 'Incorrect'}
										</span>
									</div>
									<div
										dangerouslySetInnerHTML={{ __html: question.question }}
									/>
									<div className="mt-2">
										<strong>Your answer:</strong>{' '}
										{userAnswer?.answer || 'No answer'}
									</div>
									{!isCorrect && (
										<div className="mt-1">
											<strong>Correct answer: </strong>
											{question.question_type === 'fill_in_blank'
												? question.possible_answers?.join(', ')
												: question.choices?.find((c: Choice) => c.is_correct)
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

	if (showResults) {
		return (
			<div className="container mt-4">
				{renderResults()}
				<div className="d-flex gap-2">
					<Button
						variant="primary"
						onClick={() => navigate(`/CV/Courses/${cid}/Quizzes/${qid}`)}
					>
						Back to Quiz Details
					</Button>
					<Button
						variant="success"
						onClick={() => navigate(`/CV/Courses/${cid}/Quizzes/${qid}/edit`)}
					>
						Edit Quiz
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
												<strong>Attempts Remaining:</strong>{' '}
												{quiz.multiple_attempts
													? `${quiz.number_of_attempts}`
													: '1'}
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
									<Button variant="danger" onClick={startQuiz}>
										Start Quiz
									</Button>
									<div className="d-flex gap-2">
										<Button
											variant="success"
											onClick={() =>
												navigate(`/CV/Courses/${cid}/Quizzes/${qid}/edit`)
											}
										>
											Edit Quiz
										</Button>
										<Button
											variant="secondary"
											onClick={() =>
												navigate(`/CV/Courses/${cid}/Quizzes/${qid}`)
											}
										>
											Back
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const currentQuestion = questions[currentQuestionIndex];
	const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

	if (!quiz) return <div>Loading quiz...</div>;

	return (
		<div className="container-fluid quiz-taking-interface">
			<div className="quiz-header bg-light border-bottom p-3 sticky-top">
				<div className="row align-items-center">
					<div className="col-md-3">
						<h5 className="mb-0">{quiz.title}</h5>
					</div>
					<div className="col-md-4 text-center">
						<ProgressBar
							now={progress}
							label={`${currentQuestionIndex + 1}/${questions.length}`}
						/>
					</div>
					<div className="col-md-3 text-end">
						<div className="d-flex flex-column align-items-end">
							{startTime && (
								<div className="text-muted small mb-1">
									Started: {startTime.toLocaleTimeString()}
								</div>
							)}
							<div className="d-flex align-items-center">
								<BsClock className="me-2" />
								<span
									className={`badge ${timeRemaining < 300 ? 'bg-danger' : 'bg-danger'} fs-6`}
								>
									{formatTime(timeRemaining)}
								</span>
							</div>
						</div>
					</div>
					<div className="col-md-2 text-end">
						<Button
							variant="success"
							size="sm"
							onClick={() => navigate(`/CV/Courses/${cid}/Quizzes/${qid}/edit`)}
							title="Return to Quiz Editor"
						>
							Edit Quiz
						</Button>
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
