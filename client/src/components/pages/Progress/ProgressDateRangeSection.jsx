import React from 'react';
import { BsCalendarEvent } from "react-icons/bs";
export default function ProgressDateRangeSection({
	appliedEndDate,
	appliedStartDate,
	commonStyle,
	onApplyRange,
	onOpenDatePicker,
	onResetRange,
	pickerError,
	progressStyles,
	selectedEndDate,
	selectedStartDate,
}) {
	return (
		<div style={{ ...progressStyles.card, marginBottom: '18px' }}>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
				<h2 style={{ ...commonStyle.title, margin: 0, fontSize: '34px', textAlign: 'center' }}>Choose the time range</h2>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
					<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', flex: '1 1 auto' }}>
						<button
							type="button"
							style={{ ...commonStyle.button, width: 'auto', padding: '8px 12px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 auto', minWidth: '120px', fontSize: '30px' }}
							onClick={() => onOpenDatePicker('start')}
						>
							From: {selectedStartDate || appliedStartDate || <div style={{ fontSize: '74px', display: 'flex', alignItems: 'center' }}><BsCalendarEvent /></div>}
						</button>
						<button
							type="button"
							style={{ ...commonStyle.button, width: 'auto', padding: '8px 12px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 auto', minWidth: '120px', fontSize: '30px' }}
							onClick={() => onOpenDatePicker('end')}
						>
							To: {selectedEndDate || appliedEndDate || <div style={{ fontSize: '74px', display: 'flex', alignItems: 'center' }}><BsCalendarEvent /></div>}
						</button>
					</div>
					<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', flex: '1 1 auto' }}>
						<button
							type="button"
							style={{ ...commonStyle.popupCreateButton, padding: '8px 14px', fontSize: '26px', }}
							onClick={onApplyRange}
						>
							Apply
						</button>
						<button
							type="button"
							style={{ ...commonStyle.popupCancelButton, padding: '8px 14px', fontSize: '26px', }}
							onClick={onResetRange}
						>
							Reset
						</button>
					</div>
				</div>

				{pickerError && (
					<div style={{ color: '#d32f2f', fontSize: '14px' }}>{pickerError}</div>
				)}
			</div>
		</div>
	);
}
