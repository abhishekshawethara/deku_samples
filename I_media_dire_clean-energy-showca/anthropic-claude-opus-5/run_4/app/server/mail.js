import nodemailer from 'nodemailer';

let transport;

function getTransport() {
	if (!transport) {
		const host = process.env.SMTP_HOST;
		const port = Number(process.env.SMTP_PORT || 1025);
		const user = process.env.SMTP_USER;
		const pass = process.env.SMTP_PASS;
		const options = {
			host,
			port,
			secure: false,
			ignoreTLS: true,
			tls: { rejectUnauthorized: false },
			connectionTimeout: 10000,
			greetingTimeout: 10000,
			socketTimeout: 15000
		};
		if (user && pass) options.auth = { user, pass };
		transport = nodemailer.createTransport(options);
	}
	return transport;
}

const FROM = process.env.MAIL_FROM || 'Zettajoule <no-reply@zettajoule.example>';

export async function sendMail({ to, subject, text }) {
	if (!process.env.SMTP_HOST) {
		throw new Error('SMTP_HOST is not configured');
	}
	const info = await getTransport().sendMail({ from: FROM, to, subject, text });
	return info;
}

export function enquiryMail(enquiry) {
	return {
		to: enquiry.email,
		subject: `Enquiry received: ${enquiry.reference}`,
		text: [
			`Hello ${enquiry.name},`,
			'',
			'Thank you for contacting Zettajoule. We have received your enquiry and a member of the team will reply shortly.',
			'',
			`Reference: ${enquiry.reference}`,
			`Topic: ${enquiry.topic}`,
			'',
			'Quote the reference above in any follow up.',
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
			'We have received your request for access to the Zettajoule investor document room.',
			'',
			`Reference: ${request.reference}`,
			`Organisation: ${request.organisation}`,
			`Status: ${request.status}`,
			'',
			'Your request stays pending until it is approved. We will be in touch.',
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
			'Thank you for applying to Zettajoule. Your application has been received and is with the hiring team.',
			'',
			`Role: ${job.title}`,
			`Location: ${job.location}`,
			`Team: ${job.team}`,
			'',
			'We will write again once it has been reviewed.',
			'',
			'Zettajoule'
		].join('\n')
	};
}
