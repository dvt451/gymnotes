import mongoose from 'mongoose';

const adminRolePermissionSchema = new mongoose.Schema(
	{
		role: {
			type: String,
			required: true,
			unique: true,
			index: true,
			trim: true,
			lowercase: true,
		},
		permissions: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
	},
	{ timestamps: true }
);

export default mongoose.model('AdminRolePermission', adminRolePermissionSchema);
