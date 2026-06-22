const fs = require('fs');
const path = 'client/src/components/pages/Goals/Goals.jsx';
const text = fs.readFileSync(path, 'utf8');
const lines = text.split(/\r?\n/);
const startIndex = 207 - 1; // zero-based index for the <select> start line
const endIndex = 261 - 1; // zero-based index for the end of notes block
const before = lines.slice(0, startIndex);
const after = lines.slice(endIndex + 1);
const replacement = [
	"\t\t\t\t\t<div style={goalsStyles.formRow}>",
	"\t\t\t\t\t\t<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>",
	"\t\t\t\t\t\t\t<label style={goalsStyles.metaLabel}>Exercise</label>",
	"\t\t\t\t\t\t\t<Select",
	"\t\t\t\t\t\t\t\toptions={libraryExercises.map((exercise) => ({ value: exercise._id, label: exercise.name }))}",
	"\t\t\t\t\t\t\t\tvalue={formState.exerciseUserLibraryId}",
	"\t\t\t\t\t\t\t\tonChange={handleSelectChange}",
	"\t\t\t\t\t\t\t\tstyle={popupStyle.popupInput}",
	"\t\t\t\t\t\t\t\tdisabled={libraryLoading}",
	"\t\t\t\t\t\t\t\tplaceholder=\"Choose exercise from library\"",
	"\t\t\t\t\t\t\t/>",
	"\t\t\t\t\t\t\t{libraryError && <p style={{ color: 'tomato', margin: 0 }}>{libraryError}</p>}",
	"\t\t\t\t\t\t\t{!libraryLoading && libraryExercises.length === 0 && (",
	"\t\t\t\t\t\t\t\t<p style={{ color: 'rgba(255,255,255,0.75)', margin: 0 }}>",
	"\t\t\t\t\t\t\t\t\tAdd exercises in the library before creating a goal.",
	"\t\t\t\t\t\t\t\t</p>",
	"\t\t\t\t\t\t\t)}",
	"\t\t\t\t\t\t</div>",
	"\t\t\t\t\t</div>",
	"\t\t\t\t\t<div style={goalsStyles.formRow}>",
	"\t\t\t\t\t\t<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>",
	"\t\t\t\t\t\t\t<label style={goalsStyles.metaLabel}>Target weight</label>",
	"\t\t\t\t\t\t\t<input",
	"\t\t\t\t\t\t\t\tname=\"targetWeight\"",
	"\t\t\t\t\t\t\t\ttype=\"number\"",
	"\t\t\t\t\t\t\t\tvalue={formState.targetWeight}",
	"\t\t\t\t\t\t\t\tonChange={handleInputChange}",
	"\t\t\t\t\t\t\t\tmin=\"0\"",
	"\t\t\t\t\t\t\t\tstep=\"0.5\"",
	"\t\t\t\t\t\t\t\tplaceholder=\"kg\"",
	"\t\t\t\t\t\t\t\tstyle={popupStyle.popupInput}",
	"\t\t\t\t\t\t\t/>",
	"\t\t\t\t\t\t</div>",
	"\t\t\t\t\t\t<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>",
	"\t\t\t\t\t\t\t<label style={goalsStyles.metaLabel}>Approach</label>",
	"\t\t\t\t\t\t\t<input",
	"\t\t\t\t\t\t\t\tname=\"targetSets\"",
	"\t\t\t\t\t\t\t\ttype=\"number\"",
	"\t\t\t\t\t\t\t\tvalue={formState.targetSets}",
	"\t\t\t\t\t\t\t\tonChange={handleInputChange}",
	"\t\t\t\t\t\t\t\tmin=\"1\"",
	"\t\t\t\t\t\t\t\tstep=\"1\"",
	"\t\t\t\t\t\t\t\tstyle={popupStyle.popupInput}",
	"\t\t\t\t\t\t\t/>",
	"\t\t\t\t\t\t</div>",
	"\t\t\t\t\t</div>"
];
const newText = [...before, ...replacement, ...after].join('\n');
fs.writeFileSync(path, newText, 'utf8');
console.log('Goals form block replaced');
