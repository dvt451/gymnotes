export const DEFAULT_MUSCLE_GROUPS = [
  'Shoulders',
  'Chest',
  'Triceps',
  'Biceps',
  'Back',
  'Legs',
  'Others',
];

export const DEFAULT_MUSCLE_GROUP = 'Others';

const uniqueByCaseInsensitive = (values = []) => {
  const used = new Set();

  return values.filter((value) => {
    const key = String(value || '').trim().toLowerCase();
    if (!key || used.has(key)) return false;
    used.add(key);
    return true;
  });
};

export const sanitizeMuscleGroupName = (value) => {
  if (typeof value !== 'string') return DEFAULT_MUSCLE_GROUP;

  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized || DEFAULT_MUSCLE_GROUP;
};

export const buildMuscleGroupList = (customGroups = []) => {
  const sanitizedDefaults = DEFAULT_MUSCLE_GROUPS.map(sanitizeMuscleGroupName);
  const defaultsWithoutOthers = sanitizedDefaults.filter(
    (group) => group.toLowerCase() !== DEFAULT_MUSCLE_GROUP.toLowerCase()
  );
  const customOnly = uniqueByCaseInsensitive(
    customGroups
      .map(sanitizeMuscleGroupName)
      .filter(
        (group) =>
          !sanitizedDefaults.some(
            (defaultGroup) => defaultGroup.toLowerCase() === group.toLowerCase()
          )
      )
  ).sort((left, right) => left.localeCompare(right));

  return [...defaultsWithoutOthers, ...customOnly, DEFAULT_MUSCLE_GROUP];
};

export const normalizeMuscleGroup = (
  value,
  availableGroups = DEFAULT_MUSCLE_GROUPS
) => {
  const sanitized = sanitizeMuscleGroupName(value);
  const allGroups = buildMuscleGroupList(availableGroups);
  const matched = allGroups.find(
    (group) => group.toLowerCase() === sanitized.toLowerCase()
  );

  return matched || sanitized;
};
