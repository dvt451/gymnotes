import nodemailer from 'nodemailer';

let cachedTransporter = null;

const getSmtpConfig = () => {
	const host = String(process.env.SMTP_HOST || '').trim();
	const port = Number(process.env.SMTP_PORT || 0);
	const user = String(process.env.SMTP_USER || '').trim();
	const pass = String(process.env.SMTP_PASS || '').trim();
	const from = String(process.env.SMTP_FROM || '').trim();
	const secure = String(process.env.SMTP_SECURE || '').trim().toLowerCase() === 'true' || port === 465;

	if (!host || !port || !user || !pass || !from) {
		throw new Error('SMTP is not configured');
	}

	return {
		host,
		port,
		secure,
		from,
		auth: {
			user,
			pass,
		},
	};
};

const getTransporter = () => {
	if (cachedTransporter) {
		return cachedTransporter;
	}

	const smtpConfig = getSmtpConfig();
	cachedTransporter = nodemailer.createTransport({
		host: smtpConfig.host,
		port: smtpConfig.port,
		secure: smtpConfig.secure,
		auth: smtpConfig.auth,
	});

	return cachedTransporter;
};

export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
	const smtpConfig = getSmtpConfig();
	const transporter = getTransporter();
	const appName = String(process.env.APP_NAME || 'Lift Log').trim();
	const displayName = String(name || '').trim() || 'there';

	await transporter.sendMail({
		from: smtpConfig.from,
		to,
		replyTo: process.env.SMTP_REPLY_TO || undefined,
		subject: `${appName} password reset`,
		text: [
			`Hi ${displayName},`,
			'',
			'We received a request to reset your password.',
			`Open this link to choose a new password: ${resetUrl}`,
			'',
			'This link expires in 30 minutes.',
			'If you did not request this, you can ignore this email.',
		].join('\n'),
		html: `
			<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
				<p>Hi ${displayName},</p>
				<p>We received a request to reset your password.</p>
				<p>
					<a
						href="${resetUrl}"
						style="display: inline-block; padding: 12px 20px; border-radius: 8px; background: #4caf50; color: #ffffff; text-decoration: none; font-weight: 600;"
					>
						Reset password
					</a>
				</p>
				<p>If the button does not work, copy and paste this link into your browser:</p>
				<p><a href="${resetUrl}">${resetUrl}</a></p>
				<p>This link expires in 30 minutes.</p>
				<p>If you did not request this, you can ignore this email.</p>
			</div>
		`,
	});
};
