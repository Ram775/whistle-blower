import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const getUploadPath = (folder, filename) => {
    if (!filename) return null;
    const filePath = path.join(process.cwd(), 'uploads', folder, filename);
    return fs.existsSync(filePath) ? filePath : null;
};

// Shared premium email layout. Presentation-only helper; mail/business logic is unchanged.
const wrapEmailTemplate = (content, headerColor = '#17324f', headerTitle = 'Whistle-Blower Portal') => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>${headerTitle}</title>
        <style>
            body, table, td, p, h1, h2, h3, a {
                font-family: Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            @media only screen and (max-width: 620px) {
                .email-outer { padding: 18px 10px !important; }
                .email-card { border-radius: 10px !important; }
                .email-header { padding: 25px 22px !important; }
                .email-body { padding: 27px 22px !important; }
                .email-footer { padding: 20px 22px !important; }
                .email-title { font-size: 19px !important; }
                .email-copy { font-size: 14px !important; }
            }
        </style>
    </head>
    <body style="margin:0;padding:0;background-color:#f3f6fa;color:#243449;font-family:Inter,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#f3f6fa;">
            <tr>
                <td class="email-outer" align="center" style="padding:38px 14px;">
                    <table class="email-card" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:separate;border-spacing:0;background:#ffffff;border:1px solid #e4eaf1;border-radius:14px;overflow:hidden;box-shadow:0 8px 28px rgba(25,45,70,.07);">
                        <tr>
                            <td style="height:5px;background-color:${headerColor};font-size:0;line-height:0;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td class="email-header" style="padding:30px 38px 25px;background:#ffffff;border-bottom:1px solid #edf1f5;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                                    <tr>
                                        <td align="left" style="vertical-align:middle;">
                                            <div style="font-size:10px;line-height:1.4;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8290a2;">Secure communication</div>
                                            <h1 class="email-title" style="margin:8px 0 0;color:#172b43;font-size:21px;line-height:1.35;font-weight:700;letter-spacing:-.35px;">${headerTitle}</h1>
                                        </td>
                                        <td align="right" style="vertical-align:middle;">
                                            <span style="display:inline-block;padding:7px 10px;border:1px solid #e5ebf2;border-radius:6px;background:#f8fafc;color:#64748b;font-size:10px;line-height:1;font-weight:700;letter-spacing:.8px;text-transform:uppercase;">Official notice</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td class="email-body email-copy" style="padding:36px 38px 38px;color:#435267;font-size:14px;line-height:1.75;font-family:Inter,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                                ${content}
                            </td>
                        </tr>
                        <tr>
                            <td class="email-footer" style="padding:22px 38px;background:#f8fafc;border-top:1px solid #e9eef4;text-align:center;">
                                <p style="margin:0;color:#78879a;font-size:11px;line-height:1.7;font-family:Inter,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                                    &copy; ${new Date().getFullYear()} Whistle-Blower Portal. All rights reserved.<br>
                                    This is an automated system notification. Please do not reply directly to this email.
                                </p>
                            </td>
                        </tr>
                    </table>
                    <div style="padding:16px 10px 0;color:#9aa6b5;font-size:10px;line-height:1.5;text-align:center;font-family:Inter,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                        Confidentiality matters. Please handle this communication appropriately.
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
`;

export const sendOtpMail = async (to, otp) => {
    try {
        const content = `
            <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 600;">Verification Code</h2>
            <p style="color: #475569; margin-bottom: 24px;">Please use the following One-Time Password (OTP) to complete your verification process. This code is valid for <strong>5 minutes</strong>.</p>
            
            <div style="background-color: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2563eb;">${otp}</span>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 24px;">If you didn't request this code, you can safely ignore this email.</p>
        `;

        await transporter.sendMail({
            from: `"Support Team" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Your OTP Code',
            html: wrapEmailTemplate(content, '#0f172a', 'Whistle-Blower Portal'),
        });
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
};

export const sendComplaintEmailToCustomer = async (to, firstName, complaintNo) => {
    try {
        const content = `
            <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 600;">Dear ${firstName},</h2>
            <p style="color: #475569;">Your complaint has been successfully registered in our system. Our review team will look into the matter.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
                <p style="margin: 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Complaint Reference</p>
                <p style="margin: 6px 0 0; font-size: 18px; font-weight: 700; color: #0f172a;">${complaintNo}</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"Whistle-Blower Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Complaint Registered - ${complaintNo}`,
            html: wrapEmailTemplate(content, '#0f172a', 'Whistle-Blower Portal'),
        });
    } catch (error) {
        console.error('Email error:', error);
    }
};

export const sendComplaintEmailToAdmin = async (to, complaintNo) => {
    try {
        const content = `
            <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 600;">New Complaint Received</h2>
            <p style="color: #475569;">A new complaint has been submitted to the portal and requires administrative review.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
                <p style="margin: 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Complaint No</p>
                <p style="margin: 6px 0 0; font-size: 18px; font-weight: 700; color: #0f172a;">${complaintNo}</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"Whistle-Blower Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject: `New Complaint - ${complaintNo}`,
            html: wrapEmailTemplate(content, '#0f172a', 'Admin Notification'),
        });
    } catch (error) {
        console.error('Email error:', error);
    }
};

export const sendDisclosureEmail = async (to, complaintData, addressData, complaintDocument, idPhoto) => {
    const attachments = [];

    const complaintDocPath = getUploadPath('complaintdocument', complaintDocument);
    if (complaintDocPath) {
        attachments.push({ filename: path.basename(complaintDocPath), path: complaintDocPath });
    }

    const idPhotoPath = getUploadPath('idphoto', idPhoto);
    if (idPhotoPath) {
        attachments.push({ filename: path.basename(idPhotoPath), path: idPhotoPath });
    }

    try {
        const content = `
            <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 600;">New Disclosure Submitted</h2>
            <p style="color: #475569;">Detailed disclosure information has been submitted along with attached documents.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 35%;">Complaint No:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;">${complaintData.complaint_no || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Angle:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;">${complaintData.angle_name || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Description:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${complaintData.complaint_description || ''}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Remarks:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${complaintData.remarks || 'N/A'}</td>
                </tr>
            </table>
        `;

        await transporter.sendMail({
            from: `"Whistle-Blower Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'New Disclosure Details Submitted',
            html: wrapEmailTemplate(content, '#0f172a', 'Disclosure Report'),
            attachments,
        });
    } catch (error) {
        console.error('Email error:', error);
    }
};

export const sendStatusUpdateEmail = async (to, firstName, complaintNo, statusText, comment) => {
    try {
        const content = `
            <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 600;">Dear ${firstName},</h2>
            <p style="color: #475569;">The status of your complaint has been updated by the administration team.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; width: 35%;">Complaint No:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${complaintNo}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Current Status:</td>
                        <td style="padding: 6px 0;"><span style="background-color: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: 600;">${statusText}</span></td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Admin Comment:</td>
                        <td style="padding: 6px 0; color: #0f172a;">${comment || 'N/A'}</td>
                    </tr>
                </table>
            </div>
        `;

        await transporter.sendMail({
            from: `"Whistle-Blower Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Complaint Status Updated - ${complaintNo}`,
            html: wrapEmailTemplate(content, '#0f172a', 'Status Update'),
        });
    } catch (error) {
        console.error('Email error:', error);
    }
};

export const sendResetLinkEmail = async (to, resetLink) => {
    try {
        const content = `
            <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 600;">Password Reset Request</h2>
            <p style="color: #475569;">We received a request to reset your password. Click the secure button below to proceed. This link is time-sensitive.</p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 6px; font-weight: 600; text-decoration: none; display: inline-block; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                    Reset Password
                </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        `;

        await transporter.sendMail({
            from: `"Whistle-Blower Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Password Reset Link - Whistle-Blower',
            html: wrapEmailTemplate(content, '#0f172a', 'Account Security'),
        });
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
};

// ==== 1. Login Attempt Alert ====
export const sendLoginAlertEmail = async (to, attemptsLeft, ip) => {
    try {
        const content = `
            <h2 style="color: #dc2626; margin-top: 0; font-size: 22px; font-weight: 600;">Failed Login Attempt Detected</h2>
            <p style="color: #475569;">We detected an unsuccessful login attempt on your account from an unrecognized session or IP address.</p>
            
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px; color: #991b1b; font-size: 14px;"><strong>IP Address:</strong> ${ip}</p>
                <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Attempts Remaining:</strong> <span style="font-weight: 700;">${attemptsLeft}</span></p>
            </div>
            
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #92400e;">
                    <strong>Security Warning:</strong> After ${attemptsLeft} more failed attempts, your IP address will be temporarily blocked for 15 minutes.
                </p>
            </div>
            
            <p style="color: #64748b; font-size: 13px;">If this wasn't you, please change your password immediately to secure your account.</p>
        `;

        await transporter.sendMail({
            from: `"Security Alert" <${process.env.EMAIL_USER}>`,
            to,
            subject: '⚠️ Failed Login Attempt Detected',
            html: wrapEmailTemplate(content, '#dc2626', 'Security Alert'),
        });
    } catch (error) {
        console.error('Login alert email error:', error);
    }
};

// ==== 2. Account Blocked Alert ====
export const sendAccountBlockedEmail = async (to, ip) => {
    try {
        const content = `
            <h2 style="color: #dc2626; margin-top: 0; font-size: 22px; font-weight: 600;">Account Temporarily Blocked</h2>
            <p style="color: #475569;">Your account has been temporarily restricted due to multiple consecutive failed login attempts.</p>
            
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px; color: #991b1b; font-size: 14px;"><strong>IP Address:</strong> ${ip}</p>
                <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Block Duration:</strong> 15 minutes</p>
            </div>
            
            <p style="color: #475569; margin-bottom: 24px;">If you initiated these attempts, please wait 15 minutes or reset your password to regain access immediately.</p>
            
            <div style="text-align: center; margin-bottom: 12px;">
                <a href="${process.env.FRONTEND_URL}/admin/forgot-password" style="background-color: #dc2626; color: #ffffff; padding: 12px 28px; border-radius: 6px; font-weight: 600; text-decoration: none; display: inline-block; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);">
                    Reset Password
                </a>
            </div>
        `;

        await transporter.sendMail({
            from: `"Security Alert" <${process.env.EMAIL_USER}>`,
            to,
            subject: '🚨 Your Account Has Been Temporarily Blocked',
            html: wrapEmailTemplate(content, '#dc2626', 'Security Alert'),
        });
    } catch (error) {
        console.error('Block alert email error:', error);
    }
};

// ==== 3. OTP Send Limit Reached Alert ====
export const sendOtpLimitEmail = async (to) => {
    try {
        const content = `
            <h2 style="color: #dc2626; margin-top: 0; font-size: 22px; font-weight: 600;">OTP Request Limit Reached</h2>
            <p style="color: #475569;">You have requested multiple OTPs within a short period. For security reasons, your OTP dispatch limit has been temporarily exhausted.</p>
            
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Restriction:</strong> Please wait for 1 hour before attempting to request a new OTP code.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"Security Alert" <${process.env.EMAIL_USER}>`,
            to,
            subject: '⚠️ OTP Send Limit Reached',
            html: wrapEmailTemplate(content, '#dc2626', 'Security Notice'),
        });
    } catch (error) {
        console.error('OTP limit email error:', error);
    }
};

// ==== Universal Security Alert Email ====
export const sendSecurityAlertEmail = async (to, data) => {
    const {
        type,           // 'LOGIN_FAILED', 'LOGIN_SUCCESS', 'PASSWORD_CHANGED', 'PASSWORD_RESET'
        name = 'User',
        ip,
        userAgent,
        timestamp,
        attemptsLeft = null,
        blocked = false,
        extraMessage = ''
    } = data;

    let subject = '';
    let heading = '';
    let color = '#dc2626';
    let bodyMessage = '';

    switch (type) {
        case 'LOGIN_FAILED':
            subject = '⚠️ Failed Login Attempt on Your Account';
            heading = 'Failed Login Attempt Detected';
            bodyMessage = `We detected an unsuccessful login attempt on your account. If this was not you, please secure your account immediately.`;
            break;

        case 'LOGIN_SUCCESS':
            subject = '✅ New Login to Your Account';
            heading = 'New Login Successful';
            color = '#16a34a';
            bodyMessage = `A new login session to your account was successfully authenticated.`;
            break;

        case 'PASSWORD_CHANGED':
            subject = '🔒 Your Password Was Changed';
            heading = 'Password Changed Successfully';
            color = '#2563eb';
            bodyMessage = `Your account password has been updated. If you did not perform this action, please contact support immediately.`;
            break;

        case 'PASSWORD_RESET':
            subject = '🔑 Password Reset Link Generated';
            heading = 'Password Reset Requested';
            color = '#f59e0b';
            bodyMessage = `A password reset link has been requested for your account.`;
            break;
    }

    const content = `
        <h2 style="color: ${color}; margin-top: 0; font-size: 22px; font-weight: 600;">${heading}</h2>
        <p style="color: #334155; font-size: 16px;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; line-height: 1.6;">${bodyMessage}</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid ${color}; padding: 20px; margin: 24px 0; border-radius: 6px;">
            <p style="margin: 0 0 12px; color: #0f172a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Session Details</p>
            <table style="width: 100%; font-size: 14px; color: #334155;">
                <tr><td style="padding: 6px 0; color: #64748b; width: 35%;">Date & Time:</td><td style="padding: 6px 0; font-weight: 500;">${timestamp}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">IP Address:</td><td style="padding: 6px 0; font-weight: 500;">${ip}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Device/Browser:</td><td style="padding: 6px 0; font-weight: 500;">${userAgent || 'Unknown'}</td></tr>
                ${attemptsLeft !== null ? `<tr><td style="padding: 6px 0; color: #64748b;">Attempts Remaining:</td><td style="padding: 6px 0; color: ${color}; font-weight: 700;">${attemptsLeft}</td></tr>` : ''}
            </table>
        </div>
        
        ${blocked ? `
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 6px; margin: 24px 0;">
                <p style="color: #991b1b; margin: 0; font-weight: 600; font-size: 14px;">🚨 Your IP has been temporarily blocked for 15 minutes due to multiple failed attempts.</p>
            </div>
        ` : ''}
        
        ${extraMessage ? `<p style="color: #475569;">${extraMessage}</p>` : ''}
    `;

    try {
        await transporter.sendMail({
            from: `"Whistle-Blower Security" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: wrapEmailTemplate(content, color, 'Security Notification')
        });
        return true;
    } catch (error) {
        console.error('Security alert email failed:', error);
        return false;
    }
};