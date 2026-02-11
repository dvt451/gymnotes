import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Подсхемы
const SetSchema = new mongoose.Schema({
	reps: Number,
}, { _id: true });

const WeightSchema = new mongoose.Schema({
	weight: Number,
	sets: [SetSchema]
}, { _id: true });

const ExerciseSchema = new mongoose.Schema({
	name: String,
	weights: [WeightSchema],
}, { _id: true });

const DateSchema = new mongoose.Schema({
	date: { type: String, required: true },
	exercises: [ExerciseSchema]
}, { _id: true });

const TemplateExerciseSchema = new mongoose.Schema({
	name: { type: String, required: true },
}, { _id: true });

const TemplateSchema = new mongoose.Schema({
	name: { type: String, required: true },
	exercises: [TemplateExerciseSchema],
}, { _id: true });

// Основная схема тренировки (без user)
const trainingFileSchema = new mongoose.Schema({
	name: { type: String, required: true },
	text: String,
	dates: [DateSchema],
	templates: [TemplateSchema]
}, { _id: true });

// Схема для питания
const NutritionSchema = new mongoose.Schema({
	water: { type: Number, default: 0 },
	meal: { type: Number, default: 0 },
	protein: { type: Number, default: 0 },
	vitamin: { type: Number, default: 0 },
	lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

// Схема пользователя
const userSchema = new mongoose.Schema({
	name: { type: String, required: true },
	weight: { type: Number },
	email: { type: String, required: true, unique: true, lowercase: true },
	password: { type: String },
	nutritions: {
		type: NutritionSchema,
		default: () => ({ water: 0, meal: 0, protein: 0, vitamin: 0 })
	},
	trainingfiles: [trainingFileSchema],
	trainingOrder: {
		type: [String],
		default: []
	},
	lastNutritionReset: { type: Date, default: null }
}, {
	timestamps: true
});

// 🔐 Авто-хэш пароля перед сохранением
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	if (!this.password) return next(); // Если регистрация через Google, пароля может не быть

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (err) {
		next(err);
	}
});

// 🔐 Метод сравнения паролей
userSchema.methods.comparePassword = async function (candidatePassword) {
	try {
		return await bcrypt.compare(candidatePassword, this.password);
	} catch (error) {
		throw new Error('Password comparison failed');
	}
};

// ✅ Экспорт модели
export default mongoose.model('User', userSchema);