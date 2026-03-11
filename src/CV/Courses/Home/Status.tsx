import { Button } from 'react-bootstrap';
import { BiImport } from 'react-icons/bi';
import {
	FaBell,
	FaBullhorn,
	FaChartBar,
	FaCheckCircle,
	FaHome,
	FaSignal,
} from 'react-icons/fa';
import { MdDoNotDisturbAlt } from 'react-icons/md';

import { FacultyGated } from '../../Account/ProtectedRoute';

export default function CourseStatus() {
	return (
		<div id="wd-course-status" style={{ width: '350px' }}>
			<FacultyGated>
				<h2>Course Status</h2>
				<div className="d-flex">
					<div className="w-50 pe-1">
						<Button
							variant="secondary"
							size="lg"
							className="w-100 bg-secondary-subtle border-0 text-dark"
						>
							<MdDoNotDisturbAlt className="me-2 fs-5" /> Unpublish{' '}
						</Button>{' '}
					</div>

					<div className="w-50">
						<Button variant="success" size="lg" className="w-100 border-0">
							<FaCheckCircle className="me-2 fs-5" /> Publish{' '}
						</Button>{' '}
					</div>
				</div>
				<br />
				<Button
					variant="secondary"
					size="lg"
					className="w-100 bg-secondary-subtle border-0 text-dark mt-1 text-start"
				>
					<BiImport className="me-2 fs-5" /> Import Existing Content{' '}
				</Button>
				<Button
					variant="secondary"
					size="lg"
					className="w-100 bg-secondary-subtle border-0 text-dark mt-1 text-start"
				>
					<FaHome className="me-2 fs-5" /> Choose Home Page{' '}
				</Button>
				<Button
					variant="secondary"
					size="lg"
					className="w-100 bg-secondary-subtle border-0 text-dark mt-1 text-start"
				>
					<FaSignal className="me-2 fs-5" /> View Course Stream{' '}
				</Button>
				<Button
					variant="secondary"
					size="lg"
					className="w-100 bg-secondary-subtle border-0 text-dark mt-1 text-start"
				>
					<FaBullhorn className="me-2 fs-5" /> New Announcement{' '}
				</Button>
				<Button
					variant="secondary"
					size="lg"
					className="w-100 bg-secondary-subtle border-0 text-dark mt-1 text-start"
				>
					<FaChartBar className="me-2 fs-5" /> New Analytics{' '}
				</Button>
				<Button
					variant="secondary"
					size="lg"
					className="w-100 bg-secondary-subtle border-0 text-dark mt-1 text-start"
				>
					<FaBell className="me-2 fs-5" /> View Course Notifications{' '}
				</Button>{' '}
			</FacultyGated>
		</div>
	);
}
