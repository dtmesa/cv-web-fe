import { useEffect, useState } from 'react';
import { FormControl, ListGroup } from 'react-bootstrap';
import { BsGripVertical } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { FacultyGated } from '../../Account/ProtectedRoute';
import type { RootState } from '../../store';
import * as coursesClient from '../client';
import * as modulesClient from './client';
import LessonControlButtons from './LessonControlButtons';
import ModuleControlButtons from './ModuleControlButtons';
import ModulesControls from './ModulesControls';
import {
	addModule,
	deleteModule,
	editModule,
	setModules,
	updateModule,
} from './reducer';

export default function Modules() {
	const { cid } = useParams();
	const [moduleName, setModuleName] = useState('');
	const { modules } = useSelector((state: RootState) => state.modulesReducer);
	const dispatch = useDispatch();

	const updateModuleHandler = async (module: CVModule) => {
		await modulesClient.updateModule(module);
		dispatch(updateModule(module));
	};

	const deleteModuleHandler = async (moduleId: string) => {
		await modulesClient.deleteModule(moduleId);
		dispatch(deleteModule(moduleId));
	};

	const addModuleHandler = async () => {
		if (!cid) throw new Error('ERror adding module. Parent course not found.');
		const newModule = await coursesClient.createModuleForCourse(cid, {
			id: uuidv4(),
			name: moduleName,
			course: cid,
		});
		dispatch(addModule(newModule));
		setModuleName('');
	};

	const fetchModulesForCourse = async () => {
		const modules = await coursesClient.findModulesForCourse(cid!);
		dispatch(setModules(modules));
	};
	useEffect(() => {
		fetchModulesForCourse();
	}, [cid]);

	return (
		<div className="wd-modules">
			<FacultyGated>
				<ModulesControls
					moduleName={moduleName}
					setModuleName={setModuleName}
					addModule={addModuleHandler}
				/>
			</FacultyGated>
			<br />
			<br />
			<br />
			<br />
			<ListGroup id="wd-modules" className="rounded-0">
				{modules.map((module: CVModule) => (
					<ListGroup.Item className="wd-module p-0 mb-5 fs-5 border-">
						<div className="wd-title p-3 ps-2 bg-secondary-subtle">
							<BsGripVertical className="me-2 fs-3" />
							{!module.editing && module.name}
							{module.editing && (
								<FormControl
									className="w-50 d-inline-block"
									onChange={(e) =>
										updateModuleHandler({ ...module, name: e.target.value })
									}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											updateModuleHandler({ ...module, editing: false });
										}
									}}
									defaultValue={module.name}
								/>
							)}
							<FacultyGated>
								<ModuleControlButtons
									moduleId={module.id}
									deleteModule={(moduleId) => deleteModuleHandler(moduleId)}
									editModule={(moduleId) => dispatch(editModule(moduleId))}
								/>
							</FacultyGated>
						</div>
						{module.lessons && (
							<ListGroup className="wd-lessons rounded-0">
								{module.lessons.map((lesson: Lesson) => (
									<ListGroup.Item className="wd-lesson p-3 ps-1">
										<BsGripVertical className="me-2 fs-3" /> {lesson.name}{' '}
										<LessonControlButtons />
									</ListGroup.Item>
								))}
							</ListGroup>
						)}
					</ListGroup.Item>
				))}
			</ListGroup>
		</div>
	);
}
