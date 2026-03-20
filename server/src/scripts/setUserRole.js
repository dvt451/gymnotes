import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import User from '../models/User.js';

const VALID_ROLES = ['user', 'admin'];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolveEnv = () => {
	const env = process.env.NODE_ENV || 'development';
	const envPath = path.join(__dirname, `../../.env.${env}`);
	dotenv.config({ path: envPath });
	dotenv.config();
};

const [emailArg, roleArg = 'admin'] = process.argv.slice(2);
const email = String(emailArg || '').trim().toLowerCase();
const role = String(roleArg || 'admin').trim().toLowerCase();

const main = async () => {
	resolveEnv();

	if (!email) {
		throw new Error('Email argument is required. Example: npm run user:role -- admin@example.com admin');
	}

	if (!VALID_ROLES.includes(role)) {
		throw new Error(`Role must be one of: ${VALID_ROLES.join(', ')}`);
	}

	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI is not configured');
	}

	await mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	const user = await User.findOne({ email });
	if (!user) {
		throw new Error(`User with email ${email} was not found`);
	}

	user.role = role;
	await user.save();

	console.log(`Updated ${user.email} to role "${user.role}"`);
};

main()
	.catch((error) => {
		console.error(error.message);
		process.exitCode = 1;
	})
	.finally(async () => {
		if (mongoose.connection.readyState !== 0) {
			await mongoose.disconnect();
		}
	});
