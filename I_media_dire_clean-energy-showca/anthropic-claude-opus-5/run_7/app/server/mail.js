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

export async function sendMail(log, { to, subject, text }) {
  try {
    const info = await transport.sendMail({ from, to, subject, text });
    log?.info({ event: 'mail_sent', to, subject, message_id: info.messageId });
    return true;
  } catch (err) {
    log?.error({ event: 'mail_failed', to, subject, error: String(err && err.message) });
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
      `We have received your enquiry about ${enquiry.topic}.`,
      `Your reference is ${enquiry.reference}.`,
      '',
      `Topic: ${enquiry.topic}`,
      `Reference: ${enquiry.reference}`,
      '',
      'A member of the Zettajoule team will reply to this address.',
      '',
      'Zettajoule'
    ].join('\n')
  };
}

export function accessRequestMail(request, email, name) {
  return {
    to: email,
    subject: `Investor access requested: ${request.reference}`,
    text: [
      `Hello ${name || 'there'},`,
      '',
      `We have received an investor access request for ${request.organisation}.`,
      `Your reference is ${request.reference}.`,
      '',
      `Organisation: ${request.organisation}`,
      `Reference: ${request.reference}`,
      `Status: ${request.status}`,
      '',
      'The document room opens to you once the request is approved.',
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
      `We have received your application for ${job.title}.`,
      '',
      `Job title: ${job.title}`,
      `Location: ${job.location}`,
      `Team: ${job.team}`,
      '',
      'We read every application and will be in touch at this address.',
      '',
      'Zettajoule'
    ].join('\n')
  };
}
