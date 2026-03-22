import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import { createSelectStyle } from './SelectStyle.js';

export default function Select({
	options = [],
	value,
	onChange,
	style,
	styles: customStyles = {},
	disabled = false,
	placeholder = 'Select',
}) {
	const { mainColor } = useContext(GlobalContext);
	const defaultStyles = createSelectStyle(mainColor);
	const selectRef = useRef(null);
	const [isOpen, setIsOpen] = useState(false);

	const styles = useMemo(() => {
		const mergedStyles = Object.fromEntries(
			Object.keys(defaultStyles).map((key) => [
				key,
				{
					...(defaultStyles[key] || {}),
					...(customStyles[key] || {}),
				},
			])
		);

		return {
			...mergedStyles,
			trigger: {
				...mergedStyles.trigger,
				...(style || {}),
			},
		};
	}, [customStyles, defaultStyles, style]);

	const selectedValue = useMemo(() => {
		if (value !== undefined && value !== null && options.includes(value)) {
			return value;
		}

		return options[0] ?? '';
	}, [options, value]);

	useEffect(() => {
		if (!isOpen) return undefined;

		const handlePointerDownOutside = (event) => {
			if (!selectRef.current?.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('pointerdown', handlePointerDownOutside);
		return () => {
			document.removeEventListener('pointerdown', handlePointerDownOutside);
		};
	}, [isOpen]);

	const toggleOpen = () => {
		if (disabled) return;
		setIsOpen((prev) => !prev);
	};

	const handleSelect = (option) => {
		if (disabled) return;
		onChange?.(option);
		setIsOpen(false);
	};

	return (
		<div
			ref={selectRef}
			style={{
				...styles.container,
				...(disabled ? styles.containerDisabled : {}),
				...(isOpen ? styles.containerActive : {}),
			}}
		>
			<button
				type="button"
				style={{
					...styles.trigger,
					...(isOpen ? styles.triggerOpen : {}),
					...(disabled ? styles.triggerDisabled : {}),
				}}
				onClick={toggleOpen}
				disabled={disabled}
			>
				<div style={styles.selectedContent}>
					<span style={{ ...styles.selectedText, ...(!isOpen ? styles.selectedTextOpen : {}) }}>{selectedValue || placeholder}</span>
				</div>
				<span style={{ ...styles.icon, ...(isOpen ? styles.iconOpen : {}) }}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 15" fill="none">
						<path
							d="M7.49932 10.8155C7.22726 11.0875 6.77274 11.0875 6.49998 10.8155L0.206656 4.53826C-0.0688853 4.26272 -0.0688853 3.81587 0.206656 3.54103C0.482197 3.26549 0.929748 3.26549 1.20529 3.54103L6.99997 9.3196L12.794 3.54033C13.0702 3.26479 13.517 3.26479 13.7933 3.54033C14.0688 3.81587 14.0688 4.26272 13.7933 4.53757L7.49932 10.8155Z"
							fill="currentColor"
						/>
					</svg>
				</span>
			</button>

			<div
				style={{
					...styles.optionList,
					...(isOpen ? styles.optionListOpen : {}),
				}}
			>
				{options.map((option, index) => {
					const isActive = option === selectedValue;
					const isLast = index === options.length - 1;

					return (
						<button
							key={option}
							type="button"
							style={{
								...styles.option,
								...(index === 0 ? styles.optionFirst : {}),
								...(!isLast ? styles.optionNotLast : {}),
								...(isActive ? styles.optionActive : {}),
							}}
							onClick={() => handleSelect(option)}
						>
							{option}
						</button>
					);
				})}
			</div>
		</div>
	);
}
