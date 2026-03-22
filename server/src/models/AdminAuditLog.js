import mongoose from 'mongoose';

const auditSnapshotSchema = new mongoose.Schema(
	{
		id: { type: String, default: null },
		name: { type: String, default: '' },
		email: { type: String, default: '' },
		role: { type: String, default: '' },
		accountStatus: { type: String, default: '' },
	},
	{ _id: false }
);

const adminAuditLogSchema = new mongoose.Schema(
	{
		action: {
			type: String,
			required: true,
			index: true,
		},
		actorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			default: null,
			index: true,
		},
		actor: {
			type: auditSnapshotSchema,
			default: () => ({}),
		},
		targetUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			default: null,
			index: true,
		},
		target: {
			type: auditSnapshotSchema,
			default: () => ({}),
		},
		details: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
		ipAddress: {
			type: String,
			default: '',
		},
		userAgent: {
			type: String,
			default: '',
		},
	},
	{ timestamps: true }
);

adminAuditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AdminAuditLog', adminAuditLogSchema);
