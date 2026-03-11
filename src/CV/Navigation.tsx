import { useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import { AiOutlineDashboard } from 'react-icons/ai';
import { FaInbox, FaRegCircleUser } from 'react-icons/fa6';
import { IoCalendarOutline } from 'react-icons/io5';
import { LiaBookSolid } from 'react-icons/lia';
import { Link, useLocation } from 'react-router-dom';

export default function CVNavigation() {
	const { pathname } = useLocation();
	const [activeLink, setActiveLink] = useState<string | null>(null);

	const links = [
		{ label: 'Dashboard', path: `/CV/Dashboard`, icon: AiOutlineDashboard },
		{ label: 'Courses', path: `/CV/Dashboard`, icon: LiaBookSolid },
		{ label: 'Calendar', path: `/CV/Calendar`, icon: IoCalendarOutline },
		{ label: 'Inbox', path: `/CV/Inbox`, icon: FaInbox },
	];

	const handleClick = (label: string) => {
		setActiveLink(label);
	};

	const isActive = (linkLabel: string, linkPath: string) => {
		if (pathname.includes('/CV/Courses/')) {
			return linkLabel === 'Courses';
		}

		if (
			pathname.includes('Account') ||
			pathname.includes('Calendar') ||
			pathname.includes('Inbox') ||
			pathname.includes('Labs')
		) {
			if (activeLink) setActiveLink(null);
		}

		if (
			(linkLabel === 'Dashboard' || linkLabel === 'Courses') &&
			pathname === '/CV/Dashboard'
		) {
			if (activeLink) {
				return activeLink === linkLabel;
			}
			return linkLabel === 'Dashboard';
		}
		return pathname === linkPath;
	};

	return (
		<ListGroup
			id="wd-cv-navigation"
			style={{ width: 105 }}
			className="rounded-0 position-fixed bottom-0 top-0 d-none d-md-block bg-black z-2"
		>
			<ListGroup.Item
				id="wd-neu-link"
				target="_blank"
				href="https://www.northeastern.edu/"
				action
				className="bg-black border-0 text-center"
			>
				<img src="/images/NEU.png" width="75px" />
			</ListGroup.Item>

			<ListGroup.Item
				as={Link}
				to="/CV/Account"
				className={`text-center border-0 bg-black 
          ${pathname.includes('Account') ? 'bg-white text-danger' : 'bg-black text-white'}`}
			>
				<FaRegCircleUser
					className={`fs-1 ${pathname.includes('Account') ? 'text-danger' : 'text-white'}`}
				/>
				<br />
				Account
			</ListGroup.Item>

			{links.map((link) => (
				<ListGroup.Item
					key={`${link.path}-${link.label}`}
					as={Link}
					to={link.path}
					onClick={() => {
						handleClick(link.label);
						document.title = link.label;
					}}
					className={`bg-black text-center border-0 
            ${isActive(link.label, link.path) ? 'text-danger bg-white' : 'text-white bg-black'}`}
				>
					{link.icon({ className: 'fs-1 text-danger' })}
					<br />
					{link.label}
				</ListGroup.Item>
			))}
		</ListGroup>
	);
}
