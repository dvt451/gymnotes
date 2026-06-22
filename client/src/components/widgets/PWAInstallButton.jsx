import { useState, useEffect } from 'react'
import styled from 'styled-components'

const InstallButtonWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
`

const StyledButton = styled.button`
	padding: 8px 16px;
	background-color: #1a1a1a;
	color: white;
	border: none;
	border-radius: 6px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 8px;
	transition: all 0.3s ease;

	&:hover {
		background-color: #2d2d2d;
		transform: translateY(-1px);
	}

	&:active {
		transform: translateY(0);
	}

	svg {
		width: 18px;
		height: 18px;
	}
`

const CloseButton = styled.button`
	background: none;
	border: none;
	color: #666;
	cursor: pointer;
	font-size: 18px;
	padding: 0;
	display: flex;
	align-items: center;

	&:hover {
		color: #1a1a1a;
	}
`

export default function PWAInstallButton() {
	const [deferredPrompt, setDeferredPrompt] = useState(null)
	const [showInstallButton, setShowInstallButton] = useState(false)

	useEffect(() => {
		const handler = (e) => {
			// Prevent the mini-infobar from appearing on mobile
			e.preventDefault()
			// Stash the event for later use
			setDeferredPrompt(e)
			// Show the install button
			setShowInstallButton(true)
		}

		window.addEventListener('beforeinstallprompt', handler)

		// Check if app is already installed
		window.addEventListener('appinstalled', () => {
			setShowInstallButton(false)
			setDeferredPrompt(null)
		})

		return () => {
			window.removeEventListener('beforeinstallprompt', handler)
			window.removeEventListener('appinstalled', () => { })
		}
	}, [])

	const handleInstallClick = async () => {
		if (deferredPrompt) {
			// Show the install prompt
			deferredPrompt.prompt()
			// Wait for the user to respond to the prompt
			const { outcome } = await deferredPrompt.userChoice
			if (outcome === 'accepted') {
				console.log('User accepted the install prompt')
			} else {
				console.log('User dismissed the install prompt')
			}
			setDeferredPrompt(null)
			setShowInstallButton(false)
		}
	}

	if (!showInstallButton) {
		return null
	}

	return (
		<InstallButtonWrapper>
			<StyledButton onClick={handleInstallClick}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="12" y1="15" x2="12" y2="3" />
				</svg>
				Install App
			</StyledButton>
			<CloseButton onClick={() => setShowInstallButton(false)}>
				✕
			</CloseButton>
		</InstallButtonWrapper>
	)
}
