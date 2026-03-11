interface Course {
	name: string;
	number?: string;
	credits?: number;
	description: string;
	id: string;
}

interface Quiz {
	id: string;
	course: string;
	submissions?: Submission[];
	questions?: Question[];
	title: string;
	description: string;
	quiz_type: string;
	assignment_group: string;
	published: boolean;
	shuffle_answers: boolean;
	time_limit: number;
	multiple_attempts: boolean;
	number_of_attempts: number;
	show_correct_answers: string;
	access_code?: string;
	one_question_at_a_time: boolean;
	webcam_required: boolean;
	lock_questions_after_answering: boolean;
	due_date: Date | string;
	available_date: Date | string;
	available_until: Date | string;
	how_many_attempts: number;
}

interface Choice {
  text: string;
  is_correct: boolean;
}

interface Question {
	id?: string;
	quiz: string;
	title: string;
	points: number;
	question: string;
	question_type: 'multiple_choice' | 'true_false' | 'fill_in_blank';
	order: number;
	choices: Choice[];    
	correct_answer?: boolean;
	possible_answers: string[];
	case_sensitive: boolean;
}

interface User {
	id?: string;
	username: string;
	password: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	dob?: Date | string;
	role?: string;
	loginId?: string;
	section?: string;
	lastActivity?: Date | string;
	totalActivity?: string;
}

interface SubmissionAnswer {
	user?: string;
	id?: string;
	question: string;
	selected_choice?: string;
	boolean_answer?: boolean;
	text_answer?: string;
	points_earned: number;
	max_points: number;
	is_correct: boolean;
}

interface Submission {
	id?: string;
	quiz: string;
	user: string;
	attempt_number: number;
	status: string;
	total_score: number;
	max_possible_score: number;
	percentage: number;
	started_at: Date | string;
	submitted_at?: Date | string;
	time_taken?: number;
	answers: SubmissionAnswer[];
}

interface Enrollment {
	id: string;
	course: string;
	user: string;
	grade: number;
	letterGrade: string;
	enrollmentDate: Date | string;
	status: string;
}

interface Assignment {
	id: string;
	course?: string;
	user?: string;
	title: string;
	description: string;
	points: number;
	due_date: Date | string;
	available_date: Date | string;
	available_until: Date | string;
}

interface Course {
	id: string;
	name: string;
	number: string;
	credits: number;
	description: string;
}

interface CVModule {
	id: string;
	name: string;
	description?: string;
	course: string;
	lessons?: Lesson[];
	editing?: boolean;
}

interface Lesson {
  id?: string;
  name: string;
  content?: string;
}