import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GlobalProvider } from '../context/GlobalContext.jsx'
import './admin.css'
import AdminApp from './AdminApp.jsx'

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<GlobalProvider>
			<AdminApp />
		</GlobalProvider>
	</StrictMode>,
)
