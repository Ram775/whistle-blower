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

export const sendOtpMail = async (to, otp) => {
    try {
        await transporter.sendMail({
            from: `"Support Team" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Your OTP Code',
            html: `<div style="padding:20px;font-family:Arial;">
                <h2>Whistle-Blower Portal</h2>
                <p>Your OTP is:</p>
                <h1 style="letter-spacing:5px;">${otp}</h1>
                <p>Valid for 5 minutes.</p>
            </div>`,
        });
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
};

export const sendComplaintEmailToCustomer = async (to, firstName, complaintNo) => {
    try {
        await transporter.sendMail({
            from: `"Whistle-Blower Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Complaint Registered - ${complaintNo}`,
            html: `<div style="font-family:Arial;padding:20px;">
                <h2>Dear ${firstName},</h2>
                <p>Your complaint has been registered.</p>
                <p><strong>Complaint No:</strong> ${complaintNo}</p>
            </div>`,
        });
    } catch (error) {
        console.error('Email error:', error);
    }
};

export const sendComplaintEmailToAdmin = async (to, complaintNo) => {
    try {
        await transporter.sendMail({
            from: `"Whistle-Blower Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject: `New Complaint - ${complaintNo}`,
            html: `<div style="font-family:Arial;padding:20px;">
                <h2>New Complaint Received</h2>
                <p><strong>Complaint No:</strong> ${complaintNo}</p>
            </div>`,
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
        await transporter.sendMail({
            from: `"Whistle-Blower Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'New Disclosure Details Submitted',
            html: `<div style="font-family:Arial;padding:20px;">
                <h2>New Disclosure</h2>
                <p><strong>Complaint No:</strong> ${complaintData.complaint_no || 'N/A'}</p>
                <p><strong>Angle:</strong> ${complaintData.angle_name || 'N/A'}</p>
                <p><strong>Description:</strong> ${complaintData.complaint_description || ''}</p>
                <p><strong>Remarks:</strong> ${complaintData.remarks || ''}</p>
            </div>`,
            attachments,
        });
    } catch (error) {
        console.error('Email error:', error);
    }
};

export const sendStatusUpdateEmail = async (to, firstName, complaintNo, statusText, comment) => {
    try {
        await transporter.sendMail({
            from: `"Whistle-Blower Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Complaint Status Updated - ${complaintNo}`,
            html: `<div style="font-family:Arial;padding:20px;">
                <h2>Dear ${firstName},</h2>
                <p>Your complaint status has been updated.</p>
                <p><strong>Complaint No:</strong> ${complaintNo}</p>
                <p><strong>Status:</strong> ${statusText}</p>
                <p><strong>Comment:</strong> ${comment || 'N/A'}</p>
            </div>`,
        });
    } catch (error) {
        console.error('Email error:', error);
    }
};