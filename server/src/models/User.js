import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const nutritionSchema = new mongoose.Schema(
	{
		water: { type: Number, default: 0 },
		meal: { type: Number, default: 0 },
		protein: { type: Number, default: 0 },
		vitamin: { type: Number, default: 0 },
		lastUpdated: { type: Date, default: Date.now },
	},
	{ _id: false }
);

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Имя обязательно'],
			trim: true,
		},
		weight: {
			type: Number,
			default: null,
			min: [0, 'Вес не может быть отрицательным'],
		},
		email: {
			type: String,
			required: [true, 'Email обязателен'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, 'Некорректный email'],
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
			index: true,
		},
		password: {
			type: String,
			required: [true, 'Пароль обязателен'],
			minlength: [6, 'Пароль должен быть минимум 6 символов'],
			select: false,
		},
		nutritions: {
			type: nutritionSchema,
			default: () => ({ water: 0, meal: 0, protein: 0, vitamin: 0 }),
		},
		lastNutritionReset: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: true }
);

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
	if (!this.password || !candidatePassword) return false;
	return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
