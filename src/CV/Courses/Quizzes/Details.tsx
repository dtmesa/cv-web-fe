import { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { FaEdit } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import type { RootState } from '../../store';
import * as quizzesClient from './client';

export default function QuizDetails() {
	const { cid, qid } = useParams();
	const navigate = useNavigate();
	const { quizzes } = useSelector((state: RootState) => state.quizzesReducer);
	const [quiz, setQuiz] = useState<Quiz>();
	const [questions, setQuestions] = useState<Question[]>([]);

	useEffect(() => {
		const foundQuiz = quizzes.find((q: Quiz) => q.id === qid);
		setQuiz(foundQuiz);
		if (qid) {
			fetchQuestions();
		}
	}, [qid, quizzes]);

	const fetchQuestions = async () => {
		try {
			const fetchedQuestions = await quizzesClient.findQuestionsForQuiz(qid!);
			setQuestions(fetchedQuestions);
		} catch (error) {
			console.error('Error fetching questions:', error);
		}
	};

	if (!quiz) {
		return <div>Loading...</div>;
	}

	const totalPoints = questions.reduce(
		(sum: number, q: Question) => sum + (q.points || 0),
		0,
	);

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

	const getQuizTypeLabel = (type: string) => {
		switch (type) {
			case 'graded_quiz':
				return 'Graded Quiz';
			case 'practice_quiz':
				return 'Practice Quiz';
			case 'graded_survey':
				return 'Graded Survey';
			case 'ungraded_survey':
				return 'Ungraded Survey';
			default:
				return type;
		}
	};

	const getAssignmentGroupLabel = (group: string) => {
		return group.charAt(0).toUpperCase() + group.slice(1);
	};

	const getShowCorrectAnswersLabel = (option: string) => {
		switch (option) {
			case 'immediately':
				return 'Immediately';
			case 'after_due_date':
				return 'After due date';
			case 'after_last_attempt':
				return 'After last attempt';
			case 'never':
				return 'Never';
			default:
				return option;
		}
	};

	return (
		<div className="container-fluid">
			<div className="d-flex justify-content-center mb-3">
				<Button
					className="bg-secondary-subtle text-dark border-secondary me-2"
					onClick={() => navigate(`/CV/Courses/${cid}/Quizzes/${qid}/preview`)}
				>
					Preview
				</Button>
				<Button
					className="bg-secondary-subtle text-dark border-secondary"
					onClick={() => navigate(`/CV/Courses/${cid}/Quizzes/${qid}/edit`)}
				>
					<FaEdit className="me-1" /> Edit
				</Button>
			</div>
			<div className="border rounded p-3">
				<h2 className="d-flex justify-content-between align-items-center mb-4">
					{quiz.title}
				</h2>
				<div className="mb-4">
					<div className="row g-2">
						<div className="col-5 col-md-4 text-end fw-bold">
							Quiz Type&nbsp;
						</div>
						<div className="col-7 col-md-8">
							{getQuizTypeLabel(quiz.quiz_type)}
						</div>

						<div className="col-5 col-md-4 text-end fw-bold">Points&nbsp;</div>
						<div className="col-7 col-md-8">{totalPoints}</div>

						<div className="col-5 col-md-4 text-end fw-bold">
							Assignment Group&nbsp;
						</div>
						<div className="col-7 col-md-8">
							{getAssignmentGroupLabel(quiz.assignment_group)}
						</div>

						<div className="col-5 col-md-4 text-end fw-bold">
							Shuffle Answers&nbsp;
						</div>
						<div className="col-7 col-md-8">
							{quiz.shuffle_answers ? 'Yes' : 'No'}
						</div>

						<div className="col-5 col-md-4 text-end fw-bold">
							Time Limit&nbsp;
						</div>
						<div className="col-7 col-md-8">{quiz.time_limit} minutes</div>

						<div className="col-5 col-md-4 text-end fw-bold">
							Multiple Attempts&nbsp;
						</div>
						<div className="col-7 col-md-8">
							{quiz.multiple_attempts ? 'Yes' : 'No'}
							{quiz.multiple_attempts && (
								<div className="text-muted">
									<small>Maximum attempts {quiz.how_many_attempts || 1}</small>
								</div>
							)}
						</div>

						<div className="col-5 col-md-4 text-end fw-bold">
							Show Correct Answers&nbsp;
						</div>
						<div className="col-7 col-md-8">
							{getShowCorrectAnswersLabel(quiz.show_correct_answers)}
						</div>

						<div className="col-5 col-md-4 text-end fw-bold">
							One Question at a Time&nbsp;
						</div>
						<div className="col-7 col-md-8">
							{quiz.one_question_at_a_time ? 'Yes' : 'No'}
						</div>

						<div className="col-5 col-md-4 text-end fw-bold">
							Webcam Required&nbsp;
						</div>
						<div className="col-7 col-md-8">
							{quiz.webcam_required ? 'Yes' : 'No'}
						</div>

						<div className="col-5 col-md-4 text-end fw-bold">
							Lock Questions After Answering&nbsp;
						</div>
						<div className="col-7 col-md-8">
							{quiz.lock_questions_after_answering ? 'Yes' : 'No'}
						</div>
					</div>
				</div>
				<Table>
					<thead>
						<tr>
							<th>Due</th>
							<th>For</th>
							<th>Available from</th>
							<th>Until</th>
						</tr>
					</thead>
					<tbody>
						<tr className="align-middle">
							<td>{formatDate(quiz.due_date)}</td>
							<td>Everyone</td>
							<td>{formatDate(quiz.available_date)}</td>
							<td>{formatDate(quiz.available_until)}</td>
						</tr>
					</tbody>
				</Table>
			</div>
		</div>
	);
}
