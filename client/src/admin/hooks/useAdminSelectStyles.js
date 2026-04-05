import { useMemo } from 'react'

export default function useAdminSelectStyles() {
	return useMemo(() => ({
		container: {
			minWidth: '140px',
		},
		containerActive: {
			zIndex: 8,
		},
		trigger: {
			minHeight: '52px',
			borderRadius: '14px',
			padding: '14px 16px',
			border: '1px solid rgba(84, 56, 24, 0.16)',
			background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(247, 238, 226, 0.96))',
			boxShadow: '0 10px 24px rgba(84, 56, 24, 0.08)',
			color: '#2f241b',
			fontSize: '1rem',
			fontWeight: 600,
		},
		triggerOpen: {
			background: 'linear-gradient(135deg, #b85c38, #8f3f1f)',
			border: '1px solid rgba(143, 63, 31, 0.38)',
			boxShadow: '0 16px 30px rgba(143, 63, 31, 0.26)',
			color: '#fff7f0',
		},
		triggerDisabled: {
			opacity: 0.58,
			background: 'linear-gradient(180deg, rgba(244, 238, 231, 0.92), rgba(235, 226, 215, 0.96))',
			boxShadow: 'none',
			cursor: 'not-allowed',
		},
		selectedContent: {
			gap: '12px',
		},
		selectedText: {
			fontSize: '1rem',
			letterSpacing: '0.01em',
		},
		icon: {
			color: 'inherit',
		},
		optionList: {
			marginTop: '8px',
			borderRadius: '16px',
			border: '1px solid rgba(84, 56, 24, 0.12)',
			boxShadow: '0 18px 32px rgba(47, 36, 27, 0.18)',
			background: 'rgba(252, 246, 239, 0.98)',
			backdropFilter: 'blur(14px)',
			maxHeight: '220px',
			overflow: 'hidden auto',
		},
		option: {
			border: 'none',
			borderBottom: '1px solid rgba(84, 56, 24, 0.08)',
			background: 'transparent',
			color: '#2f241b',
			padding: '14px 16px',
			fontSize: '1rem',
		},
		optionFirst: {
			borderTop: 'none',
		},
		optionNotLast: {
			borderBottom: '1px solid rgba(84, 56, 24, 0.08)',
		},
		optionActive: {
			background: 'rgba(184, 92, 56, 0.14)',
			color: '#8f3f1f',
			fontWeight: 700,
		},
	}), [])
}
