import React, { useEffect, useRef } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';
let googleScriptPromise = null;
let initializedClientId = null;
const googleCallbackState = {
	onCredential: null,
	onError: null,
};

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
	const renderedConfigRef = useRef('');

	useEffect(() => {
		googleCallbackState.onCredential = onCredential;
		googleCallbackState.onError = onError;
	}, [onCredential, onError]);

	useEffect(() => {
		if (!clientId || !containerRef.current) return undefined;

		let isDisposed = false;

		loadGoogleScript()
			.then((google) => {
				if (isDisposed || !google?.accounts?.id || !containerRef.current) return;

				if (initializedClientId !== clientId) {
					google.accounts.id.initialize({
						client_id: clientId,
						callback: (response) => {
							if (!response?.credential) {
								googleCallbackState.onError?.(
									new Error('Google did not return a credential')
								);
								return;
							}

							googleCallbackState.onCredential?.(response.credential);
						},
					});

					initializedClientId = clientId;
				}

				const renderConfig = JSON.stringify({
					clientId,
					text,
					width: containerRef.current.offsetWidth || 320,
				});
				if (renderedConfigRef.current === renderConfig) return;

				containerRef.current.innerHTML = '';
				google.accounts.id.renderButton(containerRef.current, {
					theme: 'filled_black',
					size: 'large',
					type: 'standard',
					shape: 'rectangular',
					text,
					width: containerRef.current.offsetWidth || 320,
				});
				renderedConfigRef.current = renderConfig;
			})
			.catch(() => {
				if (!isDisposed) {
					googleCallbackState.onError?.(new Error('Failed to load Google sign-in'));
				}
			});

		return () => {
			isDisposed = true;
			if (containerRef.current && initializedClientId !== clientId) {
				containerRef.current.innerHTML = '';
			}
		};
	}, [clientId, text]);

	if (!clientId) return null;

	return <div ref={containerRef} style={{ width: '100%' }} />;
}
