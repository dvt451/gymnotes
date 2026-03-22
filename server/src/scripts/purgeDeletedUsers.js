import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { deleteUserData } from '../utils/deleteUserData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolveEnv = () => {
	const env = process.env.NODE_ENV || 'development';
	const envPath = path.join(__dirname, `../../.env.${env}`);
	dotenv.config({ path: envPath });
	dotenv.config();
};

const rawDays = Number(process.argv[2] || 30);
const days = Number.isFinite(rawDays) ? Math.max(rawDays, 0) : 30;

const main = async () => {
	resolveEnv();

	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI is not configured');
	}

	await mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
	const deletedUsers = await User.find({
		isDeleted: true,
		deletedAt: { $lte: threshold },
	}).select('_id email deletedAt');

	for (const user of deletedUsers) {
		await deleteUserData(user._id);
		await User.deleteOne({ _id: user._id });
		console.log(`Purged deleted user ${user.email}`);
	}

	console.log(`Purged ${deletedUsers.length} deleted users older than ${days} days`);
};

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
const currentPath = fileURLToPath(import.meta.url);

if (invokedPath === currentPath) {
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
}
