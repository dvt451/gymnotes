import React, { useEffect, useRef } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';
let googleScriptPromise = null;

const loadGoogleScript = () => {
	if (window.google?.accounts?.id) {
		return Promise.resolve(window.google);
	}

	if (googleScriptPromise) {
		return googleScriptPromise;
	}

	googleScriptPromise = new Promise((resolve, reject) => {
		const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
		if (existingScript) {
			existingScript.addEventListener('load', () => resolve(window.google), { once: true });
			existingScript.addEventListener('error', reject, { once: true });
			return;
		}

		const script = document.createElement('script');
		script.id = GOOGLE_SCRIPT_ID;
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		script.defer = true;
		script.onload = () => resolve(window.google);
		script.onerror = reject;
		document.head.appendChild(script);
	});

	return googleScriptPromise;
};

export default function GoogleAuthButton({
	clientId,
	onCredential,
	onError,
	text = 'signin_with',
}) {
	const containerRef = useRef(null);

	useEffect(() => {
		if (!clientId || !containerRef.current) return undefined;

		let isDisposed = false;

		loadGoogleScript()
			.then((google) => {
				if (isDisposed || !google?.accounts?.id || !containerRef.current) return;

				google.accounts.id.initialize({
					client_id: clientId,
					callback: (response) => {
						if (!response?.credential) {
							onError?.(new Error('Google did not return a credential'));
							return;
						}

						onCredential?.(response.credential);
					},
				});

				containerRef.current.innerHTML = '';
				google.accounts.id.renderButton(containerRef.current, {
					theme: 'filled_black',
					size: 'large',
					type: 'standard',
					shape: 'rectangular',
					text,
					width: containerRef.current.offsetWidth || 320,
				});
			})
			.catch(() => {
				if (!isDisposed) {
					onError?.(new Error('Failed to load Google sign-in'));
				}
			});

		return () => {
			isDisposed = true;
			if (containerRef.current) {
				containerRef.current.innerHTML = '';
			}
		};
	}, [clientId, onCredential, onError, text]);

	if (!clientId) return null;

	return <div ref={containerRef} style={{ width: '100%' }} />;
}
