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
	searchable = false,
}) {
	const { mainColor } = useContext(GlobalContext);
	const defaultStyles = createSelectStyle(mainColor);
	const selectRef = useRef(null);
	const searchInputRef = useRef(null);
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

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

	const normalizedOptions = useMemo(() => {
		return (options || []).map((option) => {
			if (option && typeof option === 'object' && 'value' in option) {
				return {
					value: option.value,
					label: option.label ?? String(option.value),
				};
			}

			return {
				value: option,
				label: String(option),
			};
		});
	}, [options]);

	const filteredOptions = useMemo(() => {
		if (!searchable || !searchQuery.trim()) {
			return normalizedOptions;
		}

		const query = searchQuery.toLowerCase().trim();
		return normalizedOptions.filter((option) =>
			option.label.toLowerCase().includes(query)
		);
	}, [normalizedOptions, searchQuery, searchable]);

	const selectedOption = useMemo(() => {
		return normalizedOptions.find((option) => String(option.value) === String(value));
	}, [normalizedOptions, value]);

	useEffect(() => {
		if (!isOpen) {
			setSearchQuery('');
			return undefined;
		}

		if (searchable && searchInputRef.current) {
			setTimeout(() => searchInputRef.current?.focus(), 0);
		}

		const handlePointerDownOutside = (event) => {
			if (!selectRef.current?.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('pointerdown', handlePointerDownOutside);
		return () => {
			document.removeEventListener('pointerdown', handlePointerDownOutside);
		};
	}, [isOpen, searchable]);

	const toggleOpen = () => {
		if (disabled) return;
		setIsOpen((prev) => !prev);
	};

	const handleSelect = (option) => {
		if (disabled) return;
		onChange?.(option?.value ?? option);
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
					<span style={{ ...styles.selectedText, ...(!isOpen ? styles.selectedTextOpen : {}) }}>{selectedOption?.label || placeholder}</span>
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
				{searchable && (
					<input
						ref={searchInputRef}
						type="text"
						placeholder="Search..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						style={{
							width: '100%',
							padding: '8px 12px',
							border: 'none',
							borderBottom: `1px solid rgba(255,255,255,0.1)`,
							backgroundColor: 'rgba(255,255,255,0.05)',
							color: 'white',
							fontSize: '14px',
							boxSizing: 'border-box',
							outline: 'none',
						}}
						onPointerDown={(e) => e.stopPropagation()}
					/>
				)}

				{filteredOptions.length === 0 ? (
					<div
						style={{
							padding: '12px',
							textAlign: 'center',
							color: 'rgba(255,255,255,0.5)',
							fontSize: '14px',
						}}
					>
						{searchable && searchQuery ? 'No results found' : 'No options available'}
					</div>
				) : (
					filteredOptions.map((option, index) => {
						const isActive = String(option.value) === String(selectedOption?.value);
						const isLast = index === filteredOptions.length - 1;

						return (
							<button
								key={String(option.value)}
								type="button"
								style={{
									...styles.option,
									...(index === 0 ? styles.optionFirst : {}),
									...(!isLast ? styles.optionNotLast : {}),
									...(isActive ? styles.optionActive : {}),
								}}
								onClick={() => handleSelect(option)}
							>
								{option.label}
							</button>
						);
					})
				)}
			</div>
		</div>
	);
}
