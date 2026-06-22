const fs = require('fs');
const path = 'client/src/components/pages/Goals/Goals.jsx';
const text = fs.readFileSync(path, 'utf8');
const startMarker = '<div style={goalsStyles.formRow}>';
const targetMarker = '                                        <label style={goalsStyles.metaLabel}>Target sets</label>';
const start = text.indexOf(targetMarker);
if (start < 0) {
	console.error('start marker not found');
	process.exit(1);
}
const endMarker = '                                    </div>\n\t\t\t\t\t\t\t\t</div>\n';
// since exact whitespace is hard, use a simpler substring from target reps label to before error message
const endSearch = '                                {error && <p style={{ color: \'tomato\' }}>{error}</p>}'
const end = text.indexOf(endSearch, start);
if (end < 0) {
	console.error('end marker not found');
	process.exit(1);
}
const before = text.slice(0, start);
const after = text.slice(end);
const replacement = `					<div style={goalsStyles.formRow}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<label style={goalsStyles.metaLabel}>Target weight</label>
							<input
								name="targetWeight"
								type="number"
								value={formState.targetWeight}
								onChange={handleInputChange}
								min="0"
								step="0.5"
								placeholder="kg"
								style={popupStyle.popupInput}
							/>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<label style={goalsStyles.metaLabel}>Approach</label>
							<input
								name="targetSets"
								type="number"
								value={formState.targetSets}
								onChange={handleInputChange}
								min="1"
								step="1"
								style={popupStyle.popupInput}
							/>
						</div>
					</div>
`;
const newText = before + replacement + after;
fs.writeFileSync(path, newText, 'utf8');
console.log('patched');
