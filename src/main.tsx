import 'bootstrap/dist/css/bootstrap.min.css';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root not found');

createRoot(rootElement).render(<App />);
