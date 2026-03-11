import { useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa6';
import GreenCheckmark from './GreenCheckmark';

import ModuleEditor from './ModuleEditor';

export default function ModulesControls({
	moduleName,
	setModuleName,
	addModule,
}: {
	moduleName: string;
	setModuleName: (title: string) => void;
	addModule: () => void;
}) {
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	return (
		<div id="wd-modules-controls" className="text-nowrap">
			<Button variant="danger" onClick={handleShow}>
				<FaPlus className="position-relative me-2" style={{ bottom: '1px' }} />
				Module
			</Button>
			<ModuleEditor
				show={show}
				handleClose={handleClose}
				dialogTitle="Add Module"
				moduleName={moduleName}
				setModuleName={setModuleName}
				addModule={addModule}
			/>
			<Dropdown className="float-end me-2">
				<Dropdown.Toggle
					size="lg"
					id="wd-publish-all-btn"
					className="btn bg-secondary-subtle border-0 me-1 float-end text-dark"
				>
					<GreenCheckmark /> Publish All
				</Dropdown.Toggle>
				<Dropdown.Menu>
					<Dropdown.Item id="wd-publish-all">Publish All</Dropdown.Item>
					<Dropdown.Item id="wd-publish-all-modules-and-items">
						Publish all modules and items
					</Dropdown.Item>
					<Dropdown.Item id="wd-publish-modules-only">
						Publish modules only
					</Dropdown.Item>
					<Dropdown.Item id="wd-unpublish-all-modules-and-items">
						Unpublish all modules and items
					</Dropdown.Item>
					<Dropdown.Item id="wd-unpublish-modules-only">
						Unpublish modules only
					</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>
			<Button
				variant="secondary"
				size="lg"
				className="btn bg-secondary-subtle border-0 me-1 float-end text-dark"
				id="wd-collapse-all-btn"
			>
				Collapse All
			</Button>
			<Button
				size="lg"
				className="btn bg-secondary-subtle border-0 me-1 float-end text-dark"
				id="wd-view-progress-btn"
			>
				View Progress
			</Button>
		</div>
	);
}
