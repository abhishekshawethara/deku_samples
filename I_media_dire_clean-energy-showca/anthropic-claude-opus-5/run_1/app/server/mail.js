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

export async function sendMail({ to, subject, text }) {
	return transport.sendMail({ from, to, subject, text });
}

export function enquiryMail(enquiry) {
	return {
		to: enquiry.email,
		subject: `Enquiry received: ${enquiry.reference}`,
		text: [
			`Hello ${enquiry.name},`,
			'',
			'We have received your enquiry and a member of the team will reply shortly.',
			'',
			`Reference: ${enquiry.reference}`,
			`Topic: ${enquiry.topic}`,
			'',
			'Zettajoule'
		].join('\n')
	};
}

export function accessRequestMail(account, request) {
	return {
		to: account.email,
		subject: `Investor access requested: ${request.reference}`,
		text: [
			`Hello ${account.display_name},`,
			'',
			'Your request for access to the investor document room has been recorded and is pending review.',
			'',
			`Reference: ${request.reference}`,
			`Organisation: ${request.organisation}`,
			`Role: ${request.role_title}`,
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
			'Thank you for applying. Your application has been received and is with the hiring team.',
			'',
			`Role: ${job.title}`,
			`Location: ${job.location}`,
			`Team: ${job.team}`,
			'',
			'Zettajoule'
		].join('\n')
	};
}
