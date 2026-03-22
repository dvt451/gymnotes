import AdminAuditLog from '../models/AdminAuditLog.js';

const toSnapshot = (user) => {
	if (!user) {
		return {
			id: null,
			name: '',
			email: '',
			role: '',
			accountStatus: '',
		};
	}

	return {
		id: user._id?.toString?.() || user.id?.toString?.() || null,
		name: user.name || '',
		email: user.email || '',
		role: user.role || '',
		accountStatus: user.accountStatus || '',
	};
};

export const logAdminAction = async ({ req, action, targetUser = null, details = {} }) => {
	try {
		await AdminAuditLog.create({
			action,
			actorId: req.currentUser?._id || null,
			actor: toSnapshot(req.currentUser),
			targetUserId: targetUser?._id || null,
			target: toSnapshot(targetUser),
			details,
			ipAddress:
				req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
				req.socket?.remoteAddress ||
				'',
			userAgent: req.headers['user-agent'] || '',
		});
	} catch (error) {
		console.error('Failed to write admin audit log:', error);
	}
};
