import { Provider } from 'react-redux';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import CV from './CV';
import store from './CV/store';

export default function App() {
	return (
		<HashRouter>
			<Provider store={store}>
				<div>
					<Routes>
						<Route path="/" element={<Navigate to="CV" />} />
						<Route path="/CV/*" element={<CV />} />
					</Routes>
				</div>
			</Provider>
		</HashRouter>
	);
}
