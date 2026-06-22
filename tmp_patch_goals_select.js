const fs = require('fs');
const path = require('path');
const file = path.join('client', 'src', 'components', 'pages', 'Goals', 'Goals.jsx');
let txt = fs.readFileSync(file, 'utf8');
const marker = 'name="exerciseName"';
const idx = txt.indexOf(marker);
if (idx < 0) {
	console.error('needle not found');
	process.exit(1);
}
const labelStart = txt.lastIndexOf('<label style={goalsStyles.metaLabel}>Exercise</label>', idx);
const nextDiv = txt.indexOf('<div style={{ display: \'flex\', flexDirection: \'column\', gap: \'8px\' }}>', idx);
if (labelStart < 0 || nextDiv < 0) {
	console.error('block boundaries not found', { labelStart, nextDiv });
	process.exit(1);
}
const inputEnd = txt.indexOf('</div>', nextDiv);
if (inputEnd < 0) {
	console.error('end of input block not found');
	process.exit(1);
}
const replaceEnd = inputEnd + '</div>'.length;
const replacement = `                                        <label style={goalsStyles.metaLabel}>Exercise</label>\r\n                                        <select\r\n                                            name="exerciseUserLibraryId"\r\n                                            value={formState.exerciseUserLibraryId}\r\n                                            onChange={handleInputChange}\r\n                                            style={popupStyle.popupInput}\r\n                                            disabled={libraryLoading}\r\n                                        >\r\n                                            <option value="">Choose exercise from library</option>\r\n                                            {libraryExercises.map((exercise) => (\r\n                                                <option key={exercise._id} value={exercise._id}>\r\n                                                    {exercise.name}\r\n                                                </option>\r\n                                            ))}\r\n                                        </select>\r\n                                        {libraryError && <p style={{ color: 'tomato', margin: 0 }}>{libraryError}</p>}\r\n                                        {!libraryLoading && libraryExercises.length === 0 && (\r\n                                            <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0 }}>\r\n                                                Add exercises in the library before creating a goal.\r\n                                            </p>\r\n                                        )}\r\n                                    </div>`;

const before = txt.slice(labelStart, replaceEnd);
if (!before.includes('input') || !before.includes('exerciseName')) {
	console.error('unexpected block content');
	process.exit(1);
}
const out = txt.slice(0, labelStart) + replacement + txt.slice(replaceEnd);
fs.writeFileSync(file, out, 'utf8');
console.log('patched');
