import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'mailpit';
const port = Number(process.env.SMTP_PORT || 1025);
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';
const from = process.env.MAIL_FROM || 'Zettajoule <no-reply@zettajoule.example>';

const transport = nodemailer.createTransport({
	host,
	port,
	secure: false,
	ignoreTLS: true,
	...(user || pass ? { auth: { user, pass } } : {})
});

export async function sendMail({ to, subject, text }, log) {
	try {
		const info = await transport.sendMail({ from, to, subject, text });
		log?.info?.({ event: 'mail_sent', to, subject, message_id: info.messageId });
		return true;
	} catch (err) {
		log?.error?.({ event: 'mail_failed', to, subject, error: String(err?.message || err) });
		return false;
	}
}

export function enquiryMail(enquiry) {
	return {
		to: enquiry.email,
		subject: `Enquiry received: ${enquiry.reference}`,
		text: [
			`Hello ${enquiry.name},`,
			'',
			'We have received your enquiry and a member of the team will be in touch.',
			'',
			`Reference: ${enquiry.reference}`,
			`Topic: ${enquiry.topic}`,
			'',
			'Quote the reference above in any reply.',
			'',
			'Zettajoule'
		].join('\n')
	};
}

export function accessRequestMail(request, account) {
	return {
		to: account.email,
		subject: `Investor access requested: ${request.reference}`,
		text: [
			`Hello ${account.display_name},`,
			'',
			'Your request for access to the Zettajoule investor document room has been recorded and is pending review.',
			'',
			`Reference: ${request.reference}`,
			`Organisation: ${request.organisation}`,
			`Role: ${request.role_title}`,
			'',
			'The document room opens once the request is approved.',
			'',
			'Zettajoule'
		].join('\n')
	};
}

export function applicationMail(application, job) {
	return {
		to: application.email,
		subject: `Application received: ${job.title}`,
		text: [
			`Hello ${application.name},`,
			'',
			'Thank you for applying to Zettajoule. Your application has been received.',
			'',
			`Role: ${job.title}`,
			`Location: ${job.location}`,
			`Team: ${job.team}`,
			'',
			'The hiring team will review it and come back to you.',
			'',
			'Zettajoule'
		].join('\n')
	};
}
