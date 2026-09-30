const nodemailer = require('nodemailer');

const requiredMailSettings = [
  'MAIL_HOST',
  'MAIL_PORT',
  'MAIL_USER',
  'MAIL_PASSWORD',
];
const missingSettings = requiredMailSettings.filter(
  (name) => !process.env[name],
);

if (missingSettings.length > 0) {
  throw new Error(`Missing mail configuration: ${missingSettings.join(', ')}`);
}

const port = Number(process.env.MAIL_PORT);

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port,
  secure: false,
  pool: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false,
  },
});

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const sendApplicationNotification = async ({
  ownerName,
  ownerEmail,
  applicantName,
  applicantEmail,
  applicationDate,
  jobTitle,
  jobType,
  experienceLevel,
}) => {
  const escaped = {
    ownerName: escapeHtml(ownerName),
    applicantName: escapeHtml(applicantName),
    applicantEmail: escapeHtml(applicantEmail),
    applicationDate: escapeHtml(applicationDate),
    jobTitle: escapeHtml(jobTitle),
    jobType: escapeHtml(jobType),
    experienceLevel: escapeHtml(experienceLevel),
  };
  const text = [
    `Yth. ${ownerName},`,
    '',
    `Anda menerima lamaran baru untuk posisi ${jobTitle}.`,
    '',
    'RINGKASAN LAMARAN',
    `Nama kandidat     : ${applicantName}`,
    `Email             : ${applicantEmail}`,
    `Tanggal melamar   : ${applicationDate}`,
    '',
    'INFORMASI POSISI',
    `Tipe pekerjaan    : ${jobType}`,
    `Tingkat pengalaman: ${experienceLevel}`,
    '',
    'Silakan masuk ke dashboard OpenJob untuk meninjau profil kandidat dan mengambil langkah selanjutnya.',
    '',
    'Terima kasih,',
    'Tim OpenJob',
  ].join('\n');
  const html = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
      <tr>
        <td align="center" style="padding:36px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:8px;">
            <tr>
              <td style="padding:24px 32px;background-color:#17365d;border-radius:8px 8px 0 0;">
                <p style="margin:0;color:#bfdbfe;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">OpenJob</p>
                <h1 style="margin:10px 0 0;color:#ffffff;font-size:22px;font-weight:600;line-height:1.4;">Notifikasi lamaran baru</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">Yth. <strong>${escaped.ownerName}</strong>,</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#334155;">
                  Anda menerima lamaran baru untuk posisi <strong style="color:#17365d;">${escaped.jobTitle}</strong>.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-collapse:separate;border-spacing:0;">
                  <tr>
                    <td colspan="2" style="padding:13px 16px;background-color:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:bold;letter-spacing:0.8px;color:#475569;">RINGKASAN LAMARAN</td>
                  </tr>
                  <tr>
                    <td width="38%" style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Nama kandidat</td>
                    <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#1e293b;">${escaped.applicantName}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Email</td>
                    <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;"><a href="mailto:${escaped.applicantEmail}" style="color:#1d4ed8;text-decoration:none;">${escaped.applicantEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Tanggal melamar</td>
                    <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1e293b;">${escaped.applicationDate}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Tipe pekerjaan</td>
                    <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1e293b;">${escaped.jobType}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;font-size:14px;color:#64748b;">Tingkat pengalaman</td>
                    <td style="padding:12px 16px;font-size:14px;color:#1e293b;">${escaped.experienceLevel}</td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#334155;">
                  Silakan masuk ke dashboard OpenJob untuk meninjau profil kandidat dan mengambil langkah selanjutnya.
                </p>
                <p style="margin:24px 0 0;font-size:14px;line-height:1.7;">Terima kasih,<br><strong>Tim OpenJob</strong></p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 8px 8px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                  Pesan ini dikirim secara otomatis. Mohon tidak membalas email ini.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  const info = await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: ownerEmail,
    subject: `OpenJob | Lamaran baru untuk posisi ${jobTitle}`,
    text,
    html,
  });

  const acceptedBySmtp = info.accepted.some(
    (address) => address.toLowerCase() === ownerEmail.toLowerCase(),
  );
  if (!acceptedBySmtp) {
    throw new Error('SMTP did not accept the job owner as an email recipient');
  }

  return {
    messageId: info.messageId,
  };
};

module.exports = { sendApplicationNotification };
