import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import { BsTrash } from 'react-icons/bs';
import { useNavigate, useParams } from 'react-router-dom';
import '@uiw/react-md-editor/markdown-editor.css';

import * as quizzesClient from '../client';
import * as questionsClient from './client';

export default function QuestionEditor() {
	const { cid, qid, questionId } = useParams();
	const navigate = useNavigate();

	const [question, setQuestion] = useState({
		quiz: '',
		title: '',
		points: 0,
		question: '',
		question_type: 'multiple_choice' as Question['question_type'],
		order: 1,
		choices: [
			{ text: '', is_correct: false },
			{ text: '', is_correct: false },
			{ text: '', is_correct: false },
			{ text: '', is_correct: false },
		] as Choice[],
		possible_answers: [''],
		case_sensitive: false,
	});

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const loadQuestion = async () => {
			if (!questionId) return;
			setLoading(true);
			try {
				const existing = await quizzesClient.findQuestionById(qid!, questionId);

				if (!existing.possible_answers) {
					existing.possible_answers = [''];
				}
				setQuestion(existing);
			} catch (error) {
				console.error('Failed to load question', error);
				alert('Could not load question');
			} finally {
				setLoading(false);
			}
		};
		loadQuestion();
	}, [qid, questionId]);

	const updateField = <Q extends keyof typeof question>(
		field: Q,
		value: (typeof question)[Q],
	) => {
		setQuestion((prev) => ({ ...prev, [field]: value }));
	};

	const handleQuestionTypeChange = (newType: Question['question_type']) => {
		const updatedQuestion = { ...question, question_type: newType };

		if (newType === 'true_false') {
			updatedQuestion.choices = [
				{ text: 'True', is_correct: false },
				{ text: 'False', is_correct: false },
			];
		} else if (newType === 'fill_in_blank') {
			updatedQuestion.choices = [];
			updatedQuestion.possible_answers = [''];
		} else if (newType === 'multiple_choice') {
			updatedQuestion.choices = [
				{ text: '', is_correct: false },
				{ text: '', is_correct: false },
				{ text: '', is_correct: false },
				{ text: '', is_correct: false },
			];
		}

		setQuestion(updatedQuestion);
	};

	const updateChoice = (index: number, text: string) => {
		const newChoices = [...question.choices];
		newChoices[index].text = text;
		updateField('choices', newChoices);
	};

	const setCorrectAnswer = (index: number) => {
		const newChoices = question.choices.map((choice, i) => ({
			...choice,
			is_correct: i === index,
		}));
		updateField('choices', newChoices);
	};

	const addChoice = () => {
		updateField('choices', [
			...question.choices,
			{ text: '', is_correct: false },
		]);
	};

	const removeChoice = (index: number) => {
		if (question.choices.length > 2) {
			updateField(
				'choices',
				question.choices.filter((_, i) => i !== index),
			);
		}
	};

	const updateCorrectAnswer = (index: number, value: string) => {
		const newAnswers = [...question.possible_answers];
		newAnswers[index] = value;
		updateField('possible_answers', newAnswers);
	};

	const addCorrectAnswer = () => {
		updateField('possible_answers', [...question.possible_answers, '']);
	};

	const removeCorrectAnswer = (index: number) => {
		if (question.possible_answers.length > 1) {
			updateField(
				'possible_answers',
				question.possible_answers.filter((_, i) => i !== index),
			);
		}
	};

	const validateQuestion = () => {
		if (!question.title.trim() || !question.question.trim()) {
			alert('Please fill in all required fields');
			return false;
		}

		if (question.question_type === 'fill_in_blank') {
			if (
				question.possible_answers.length === 0 ||
				question.possible_answers.every((answer) => !answer.trim())
			) {
				alert(
					'Please provide at least one correct answer for the fill-in-the-blank question',
				);
				return false;
			}
			if (question.possible_answers.some((answer) => answer.trim() === '')) {
				alert('Please fill in all correct answers or remove empty ones');
				return false;
			}
		} else {
			if (!question.choices.some((c) => c.is_correct)) {
				alert('Please select a correct answer');
				return false;
			}
			if (
				question.question_type === 'multiple_choice' &&
				question.choices.some((c) => !c.text.trim())
			) {
				alert('Please fill in all choice texts');
			}
		}

		return true;
	};

	const saveQuestion = async () => {
		try {
			if (!validateQuestion()) return;

			const questionData = { ...question, quiz: qid! };

			if (questionId) {
				await questionsClient.updateQuestion(qid!, questionData);
			} else {
				await quizzesClient.createQuestion(qid!, questionData);
			}

			navigate(`/CV/Courses/${cid}/Quizzes/${qid}/edit`);
		} catch (error) {
			console.error('Error saving question:', error);
			alert('Error saving question. Please try again.');
		}
	};

	const cancelEdit = () => {
		navigate(`/CV/Courses/${cid}/Quizzes/${qid}/edit`);
	};

	const renderAnswerSection = () => {
		switch (question.question_type) {
			case 'multiple_choice':
				return (
					<div className="mt-2 mb-6">
						<h5>Answers:</h5>
						<div className="space-y-3">
							{question.choices.map((choice, index) => (
								<div key={index} className="flex items-center space-x-3">
									<input
										type="radio"
										name="correct-answer"
										checked={choice.is_correct}
										onChange={() => setCorrectAnswer(index)}
										className="w-4 h-4"
									/>

									<span className="text-sm w-28">
										{choice.is_correct
											? ' Correct Answer: '
											: ' Possible Answer: '}
										{choice.is_correct && '\u00A0\u00A0'}
									</span>

									<input
										type="text"
										value={choice.text}
										onChange={(e) => updateChoice(index, e.target.value)}
										className="flex-1 px-3 py-2 border border-gray-300 rounded"
										placeholder={`Enter answer`}
									/>

									{index >= 2 && (
										<button
											onClick={() => removeChoice(index)}
											className="p-2 bg-transparent border-0"
										>
											<BsTrash />
										</button>
									)}
								</div>
							))}
						</div>

						<button
							onClick={addChoice}
							className="mt-3 bg-secondary-subtle border border-gray rounded-2"
						>
							+ Add Another Answer
						</button>
					</div>
				);

			case 'true_false':
				return (
					<div className="mt-2 mb-6">
						<div className="space-y-3">
							{question.choices.map((choice, index) => (
								<div key={index} className="flex items-center space-x-3">
									<input
										type="radio"
										name="correct-answer"
										checked={choice.is_correct}
										onChange={() => setCorrectAnswer(index)}
										className="w-4 h-4"
									/>
									<span className="text-lg font-medium">{choice.text}</span>
									{choice.is_correct && (
										<span className="text-sm text-green-600">
											(Correct Answer)
										</span>
									)}
								</div>
							))}
						</div>
					</div>
				);

			case 'fill_in_blank':
				return (
					<div className="mt-2 mb-6">
						<h5>Answers:</h5>
						<div className="space-y-3">
							{question.possible_answers &&
								question.possible_answers.map((answer, index) => (
									<div key={index} className="flex items-center space-x-3">
										<span className="text-sm w-20 text-gray-600">
											Possible Answer:&nbsp;
										</span>
										<input
											type="text"
											value={answer}
											onChange={(e) =>
												updateCorrectAnswer(index, e.target.value)
											}
											className="flex-1 px-3 py-2 border border-gray-300 rounded"
											placeholder="Enter an answer"
										/>
										{question.possible_answers.length > 1 && (
											<button
												onClick={() => removeCorrectAnswer(index)}
												className="p-2 bg-transparent border-0"
											>
												<BsTrash />
											</button>
										)}
									</div>
								))}
						</div>
						<button
							onClick={addCorrectAnswer}
							className="mt-3 bg-secondary-subtle border border-gray rounded-2"
						>
							+ Add Another Answer
						</button>
					</div>
				);

			default:
				return null;
		}
	};

	const getInstructions = () => {
		switch (question.question_type) {
			case 'multiple_choice':
				return 'Enter your question and multiple answers, then select the one correct answer.';
			case 'true_false':
				return 'Enter your question text, then select if True or False is the correct answer.';
			case 'fill_in_blank':
				return 'Enter your question text, then define all possible correct answers for the blank. Students will see the question followed by a small text box to type their answer';
			default:
				return '';
		}
	};

	if (loading) return <div className="p-3">Loading...</div>;

	return (
		<div className="p-3">
			<div className="flex items-center space-x-4 mb-4">
				<input
					type="text"
					value={question.title}
					onChange={(e) => updateField('title', e.target.value)}
					className="me-2 px-3 py-2 border border-gray-300 rounded"
					placeholder="Enter Question Title"
				/>
				<select
					value={question.question_type}
					onChange={(e) =>
						handleQuestionTypeChange(
							e.target.value as Question['question_type'],
						)
					}
					className="me-5 px-3 py-2 border border-gray-300 rounded"
				>
					<option value="multiple_choice">Multiple Choice</option>
					<option value="true_false">True/False</option>
					<option value="fill_in_blank">Fill in the Blank</option>
				</select>
				<span className="text-sm">Points:&nbsp;</span>
				<input
					type="number"
					value={question.points}
					onChange={(e) => updateField('points', parseInt(e.target.value) || 0)}
					className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
					min="1"
				/>
			</div>

			<p className="text-sm text-gray-600 mb-4">{getInstructions()}</p>

			<div className="mb-6">
				<h5>Question:</h5>
				<div className="border border-gray-300 rounded">
					<MDEditor
						value={question.question}
						onChange={(val) => updateField('question', val || '')}
						preview="edit"
						height={200}
						visibleDragbar={false}
						data-color-mode="light"
					/>
				</div>
			</div>

			{renderAnswerSection()}

			<div className="mt-4 flex space-x-3">
				<button
					onClick={saveQuestion}
					className="me-2 btn btn-success border border-gray"
				>
					{questionId ? 'Update Question' : 'Create Question'}
				</button>
				<button
					onClick={cancelEdit}
					className="btn btn-secondary border border-gray"
				>
					Cancel
				</button>
			</div>
		</div>
	);
}
