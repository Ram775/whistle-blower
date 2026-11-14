import { Complaint, User, Address, DeterminationofVigilanceAngle, DisclosureDetail, ComplaintStatusHistory } from '../models/index.js';
import { decryptClientIdNumber } from '../utils/encryption.js';
import { sendOtpMail, sendComplaintEmailToCustomer, sendDisclosureEmail,sendOtpLimitEmail } from '../utils/mailer.js';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';




const generateComplaintNumber = async () => {
    const latest = await Complaint.findOne({ order: [['id', 'DESC']] });
    const nextId = latest ? latest.id + 1 : 1;
    const paddedId = String(nextId).padStart(3, '0');
    const d = new Date();
    const date = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
    return `GICRe/whbl/${paddedId}/${date}`;
};

export const sendOtp = async (req, res) => {
    try {
        const { email_id } = req.body;

        if (!email_id) return res.status(422).json({ success: false, message: 'Email is required' });

        // ✅ Check if limit reached (rate-limiter ka count check)
        const remaining = parseInt(req.rateLimit?.remaining || 0);
        if (remaining === 0) {
            await sendOtpLimitEmail(email_id);
            return res.status(429).json({
                success: false,
                message: 'OTP send limit reached. Please try again after 1 hour.'
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpToken = jwt.sign(
            { otp, email: email_id },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        await sendOtpMail(email_id, otp);

        return res.status(200).json({
            success: true,
            message: `OTP sent to your email. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining in this hour.`,
            otp_token: otpToken,
            attempts_remaining: remaining
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { otp, otp_token } = req.body;
        if (!otp_token) return res.status(400).json({ success: false, message: 'OTP session invalid' });

        const decoded = jwt.verify(otp_token, process.env.JWT_SECRET);
        if (decoded.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        const verifiedToken = jwt.sign(
            { email_verified: decoded.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            verified_token: verifiedToken
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'OTP expired or invalid' });
    }
};

export const submitComplaint = async (req, res) => {
    try {
        const { verified_token, email_id, id_number, ...otherData } = req.body;

        // 1. Verify OTP Token
        let decoded;
        try {
            decoded = jwt.verify(verified_token, process.env.JWT_SECRET);
        } catch (e) {
            return res.status(400).json({ message: 'Please verify your email via OTP before submitting.' });
        }

        if (decoded.email_verified.toLowerCase() !== email_id.toLowerCase()) {
            return res.status(400).json({ message: 'Email verification mismatch.' });
        }

        // 2. ✅ Check if user already exists (Duplicate Email Check)
        const existingUser = await User.findOne({ where: { email_id } });
        if (existingUser) {
            return res.status(422).json({ 
                success: false,
                message: 'This email is already registered. Please login instead.' 
            });
        }

        // 3. Decrypt ID Number
        const memberId = decryptClientIdNumber(id_number);
        if (memberId === null) {
            return res.status(400).json({ message: 'Error while decrypting ID Number' });
        }

        // 4. Handle File Uploads (Multer fields)
        const idPhotoName = req.files && req.files['id_photo'] ? req.files['id_photo'][0].filename : '';
        const complaintDocName = req.files && req.files['complaint_document'] ? req.files['complaint_document'][0].filename : '';

        // 5. Create User
        const newUser = await User.create({
            role_id: 3,
            first_name: otherData.first_name,
            middle_name: otherData.middle_name || null,
            last_name: otherData.last_name,
            email_id,
            landline_no: otherData.landline_no || null,
            mobile_no: otherData.mobile_no,
            gender: otherData.gender,
            dob: otherData.dob,
            id_type: otherData.id_type,
            id_number: memberId, // Sequelize model ka setter isko encrypt karega
            id_photo: idPhotoName,
            eligibility_of_whistle_blower: otherData.eligibility_of_whistle_blower,
            disclosure_against: otherData.disclosure_against,
            sr_number: otherData.sr_number,
            status: '1'
        });

        // 6. Handle Address
        let city_id = otherData.city_id || 1;
        await Address.create({
            user_id: newUser.id,
            address_line1: otherData.address_line1 || null,
            address_line2: otherData.address_line2 || null,
            address_line3: otherData.address_line3 || null,
            state_id: otherData.state_id || 1,
            district_id: otherData.district_id || 1,
            pincode: otherData.pincode,
            city_id: city_id
        });

        // 7. Create Complaint
        const complaint = await Complaint.create({
            user_id: newUser.id,
            determinationof_vigilance_angle_id: otherData.determinationof_vigilance_angle_id || null,
            complaint_description: otherData.complaint_description,
            remarks: otherData.remarks || null,
            complaint_document: complaintDocName,
            disclosure_against: otherData.disclosure_against
        });

        // 8. Generate Complaint Number & Update
        const cm_number = await generateComplaintNumber();
        await complaint.update({ complaint_no: cm_number });

        // 9. Status History
        await ComplaintStatusHistory.create({
            complaint_id: complaint.id,
            user_id: newUser.id,
            complaint_status: 1,
            comment: 'Complaint Registered'
        });

        // 10. Send Emails (Wrapped in try-catch so email fail ho toh pura process na ruke)
        try {
            const disclosure = await DisclosureDetail.findByPk(otherData.disclosure_against);
            if (disclosure && disclosure.email) {
                await sendDisclosureEmail(
                    disclosure.email,
                    {
                        complaint_no: cm_number,
                        angle_name: 'N/A',
                        complaint_description: otherData.complaint_description,
                        remarks: otherData.remarks
                    },
                    {
                        address_line1: otherData.address_line1,
                        address_line2: otherData.address_line2,
                        address_line3: otherData.address_line3,
                        pincode: otherData.pincode
                    },
                    complaintDocName,
                    idPhotoName
                );
            }
            await sendComplaintEmailToCustomer(email_id, otherData.first_name, cm_number);
        } catch (emailError) {
            console.error('Email sending failed (but complaint saved):', emailError.message);
        }

        return res.status(200).json({
            success: true,
            message: 'We have received your complaint',
            complaint_no: cm_number
        });

    } catch (error) {
        console.error('Submit Complaint Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const submitNewComplaint = async (req, res) => {
    try {
        const user = req.user;
        const { otp, otp_token, ...complaintData } = req.body;

        if (!otp) {
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const newToken = jwt.sign({ otp: newOtp, email: user.email_id }, process.env.JWT_SECRET, { expiresIn: '5m' });
            await sendOtpMail(user.email_id, newOtp);
            return res.status(200).json({
                success: true, send_opt: true, otp_verify: false,
                otp_token: newToken,
                message: 'OTP has been sent to your email'
            });
        }

        if (!otp_token) {
            return res.status(400).json({ success: false, message: 'OTP token missing' });
        }
        const decoded = jwt.verify(otp_token, process.env.JWT_SECRET);
        if (decoded.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const complaintDocName = req.files && req.files['complaint_document'] ? req.files['complaint_document'][0].filename : '';

        const complaint = await Complaint.create({
            user_id: user.id,
            determinationof_vigilance_angle_id: complaintData.determinationof_vigilance_angle_id,
            disclosure_against: complaintData.disclosure_against,
            complaint_description: complaintData.complaint_description,
            remarks: complaintData.remarks,
            complaint_document: complaintDocName
        });

        const cm_number = await generateComplaintNumber();
        await complaint.update({ complaint_no: cm_number });

        await ComplaintStatusHistory.create({
            complaint_id: complaint.id,
            user_id: user.id,
            complaint_status: 1,
            comment: 'Complaint Registered'
        });

        await sendComplaintEmailToCustomer(user.email_id, user.first_name, cm_number);

        return res.status(200).json({
            success: true, data_save: true,
            message: 'We have received your complaint'
        });
    } catch (error) {
        console.error('Submit New Complaint Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.findAll({
            attributes: ['id', 'user_id', 'complaint_no', 'complaint_status', 'created_at', 'determinationof_vigilance_angle_id'],
            include: [
                { model: User, as: 'user', attributes: ['first_name', 'middle_name', 'last_name', 'email_id', 'mobile_no'] },
                { model: DeterminationofVigilanceAngle, as: 'determinationofvigilanceangle', attributes: ['name'] }
            ]
        });

        const formattedData = complaints.map((row, key) => {
            let statusText = '';
            if (row.complaint_status == 1) statusText = 'Pending';
            else if (row.complaint_status == 2) statusText = 'Under Processing';
            else if (row.complaint_status == 3) statusText = 'Disposed';

            return {
                id: row.id,
                srno: key + 1,
                complaint_no: row.complaint_no,
                full_name: `${row.user?.first_name || ''} ${row.user?.middle_name || ''} ${row.user?.last_name || ''}`.trim(),
                email_id: row.user?.email_id,
                mobile_no: row.user?.mobile_no,
                complaint_date: new Date(row.created_at).toLocaleString('en-GB'),
                complaint_status: statusText,
                event: row.determinationofvigilanceangle ? row.determinationofvigilanceangle.name : 'N/A'
            };
        });

        return res.status(200).json({ status: true, data: formattedData });
    } catch (error) {
        console.error('Get Complaints:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

export const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { complaint_status, comment } = req.body;
        const adminUser = req.user; // auth middleware se aata hai

        const complaint = await Complaint.findByPk(id);
        if (!complaint) {
            return res.status(404).json({ status: false, message: 'Complaint not found' });
        }

        // 1. Status History me entry
        await ComplaintStatusHistory.create({
            complaint_id: complaint.id,
            user_id: adminUser.id,
            complaint_status: Number(complaint_status), // ✅ Number me convert
            comment: comment || null // ✅ Null safe
        });

        // 2. Complaint table me status update
        await complaint.update({
            complaint_status: Number(complaint_status), // ✅ Number me
            last_updated_by: adminUser.id
        });

        // 3. Customer ko email (agar chaho toh)
        try {
            const user = await User.findByPk(complaint.user_id);
            if (user && user.email_id) {
                const statusText = complaint_status == 1 ? 'Pending' : complaint_status == 2 ? 'Under Processing' : 'Disposed';
                const { sendStatusUpdateEmail } = await import('../utils/mailer.js');
                await sendStatusUpdateEmail(user.email_id, user.first_name, complaint.complaint_no, statusText, comment);
            }
        } catch (emailError) {
            console.error('Email failed but status updated:', emailError.message);
        }

        return res.status(200).json({ status: true, message: 'Status updated successfully' });

    } catch (error) {
        console.error('Update Status Error:', error);
        return res.status(500).json({ status: false, message: error.message || 'Internal Server Error' });
    }
};


export const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id, {
            include: [
                { 
                    model: User, 
                    as: 'user', 
                    attributes: ['first_name', 'middle_name', 'last_name', 'email_id', 'mobile_no', 'gender', 'dob', 'id_type', 'id_number', 'id_photo', 'eligibility_of_whistle_blower', 'sr_number', 'organization'] 
                },
                { 
                    model: DeterminationofVigilanceAngle, 
                    as: 'determinationofvigilanceangle', 
                    attributes: ['name'] 
                },
                { 
                    model: DisclosureDetail, 
                    as: 'disclosureDetail', 
                    attributes: ['name', 'email'] 
                },
                { 
                    model: ComplaintStatusHistory, 
                    as: 'complaint_status_history', 
                    include: [{ model: User, as: 'User', attributes: ['first_name', 'last_name'] }] 
                }
            ]
        });

        if (!complaint) {
            return res.status(404).json({ status: false, message: 'Complaint not found' });
        }

        // ✅ Authorization Check
        // Admin (role 1, 2) sab dekh sakte hain
        // Customer (role 3) sirf apni complaint dekh sakta hai
        if (Number(req.user.role_id) === 3 && Number(complaint.user_id) !== Number(req.user.id)) {
            return res.status(403).json({ status: false, message: 'Unauthorized: You can only view your own complaints.' });
        }

        return res.status(200).json({ status: true, data: complaint });

    } catch (error) {
        console.error('Get Complaint By ID Error:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};


export const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.findAll({
            where: { user_id: req.user.id },
            attributes: ['id', 'complaint_no', 'complaint_status', 'created_at', 'complaint_description'],
            include: [
                { model: DeterminationofVigilanceAngle, as: 'determinationofvigilanceangle', attributes: ['name'] }
            ],
            order: [['created_at', 'DESC']]
        });

        const formattedData = complaints.map((row, key) => {
            let statusText = '';
            if (row.complaint_status == 1) statusText = 'Pending';
            else if (row.complaint_status == 2) statusText = 'Under Processing';
            else if (row.complaint_status == 3) statusText = 'Disposed';

            return {
                id: row.id,
                srno: key + 1,
                complaint_no: row.complaint_no,
                complaint_date: new Date(row.created_at).toLocaleDateString('en-GB'),
                complaint_status: statusText,
                event: row.determinationofvigilanceangle ? row.determinationofvigilanceangle.name : 'N/A',
                complaint_description: row.complaint_description
            };
        });

        return res.status(200).json({ status: true, data: formattedData });
    } catch (error) {
        console.error('Get My Complaints Error:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};





export const generateComplaintPdf = async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id, {
            include: [
                { 
                    model: User, 
                    as: 'user', 
                    attributes: ['first_name', 'middle_name', 'last_name', 'email_id', 'mobile_no', 'gender', 'dob', 'id_type', 'id_number', 'id_photo', 'eligibility_of_whistle_blower', 'sr_number', 'organization'] 
                },
                { model: DeterminationofVigilanceAngle, as: 'determinationofvigilanceangle', attributes: ['name'] },
                { model: DisclosureDetail, as: 'disclosureDetail', attributes: ['name'] },
                { model: ComplaintStatusHistory, as: 'complaint_status_history', include: [{ model: User, as: 'User', attributes: ['first_name', 'last_name'] }] }
            ]
        });

        if (!complaint) {
            return res.status(404).json({ status: false, message: 'Complaint not found' });
        }

        // ✅ Authorization: Admin ya Owner (Customer) hi PDF dekh sakta hai
        if (Number(req.user.role_id) === 3 && Number(complaint.user_id) !== Number(req.user.id)) {
            return res.status(403).json({ status: false, message: 'Unauthorized' });
        }

        const user = complaint.user || {};
        const angle = complaint.determinationofvigilanceangle || {};
        const disclosure = complaint.disclosureDetail || {};
        const histories = complaint.complaint_status_history || [];

        // PDF Document Create karo
        const doc = new PDFDocument({ margin: 40 });
        
        // Response headers set karo
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=complaint_${complaint.complaint_no.replace(/\//g, '_')}.pdf`);
        
        doc.pipe(res);

        // ===== HEADER =====
        doc.fontSize(20).font('Helvetica-Bold').text('GICRe Whistle-Blower', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(12).font('Helvetica').text('Complaint Details Report', { align: 'center' });
        doc.moveDown(1);

        doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.5);

        // ===== COMPLAINT INFO =====
        doc.fontSize(14).font('Helvetica-Bold').text('Complaint Information', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Complaint No: ${complaint.complaint_no}`);
        doc.text(`Date: ${new Date(complaint.created_at).toLocaleString()}`);
        doc.text(`Vigilance Angle: ${angle.name || 'N/A'}`);
        doc.text(`Disclosure Against: ${disclosure.name || 'N/A'}`);
        doc.moveDown(0.5);

        doc.fontSize(10).font('Helvetica-Bold').text('Description:');
        doc.fontSize(10).font('Helvetica').text(complaint.complaint_description || 'N/A', { width: 500 });
        doc.moveDown(0.3);

        doc.fontSize(10).font('Helvetica-Bold').text('Remarks:');
        doc.fontSize(10).font('Helvetica').text(complaint.remarks || 'N/A', { width: 500 });
        doc.moveDown(1);

        // ===== COMPLAINANT INFO =====
        doc.fontSize(14).font('Helvetica-Bold').text('Complainant Information', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Name: ${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`);
        doc.text(`Email: ${user.email_id || 'N/A'}`);
        doc.text(`Mobile: ${user.mobile_no || 'N/A'}`);
        doc.text(`Gender: ${user.gender || 'N/A'}`);
        doc.text(`DOB: ${user.dob || 'N/A'}`);
        doc.text(`ID Type: ${user.id_type || 'N/A'}`);
        doc.text(`ID Number: ${user.id_number || 'N/A'}`);
        doc.text(`Eligibility: ${user.eligibility_of_whistle_blower || 'N/A'}`);
        doc.text(`SR Number: ${user.sr_number || 'N/A'}`);
        doc.moveDown(1);

        // ===== STATUS HISTORY =====
        if (histories.length > 0) {
            doc.fontSize(14).font('Helvetica-Bold').text('Status History', { underline: true });
            doc.moveDown(0.3);
            histories.forEach((h) => {
                let statusText = h.complaint_status == 1 ? 'Pending' : h.complaint_status == 2 ? 'Under Processing' : 'Disposed';
                doc.fontSize(10).font('Helvetica-Bold').text(`${statusText} - ${new Date(h.created_at).toLocaleString()}`);
                doc.fontSize(9).font('Helvetica').text(`Comment: ${h.comment || 'N/A'}`);
                doc.fontSize(9).font('Helvetica-Oblique').text(`By: ${h.User ? h.User.first_name + ' ' + h.User.last_name : 'System'}`);
                doc.moveDown(0.3);
            });
        }

        doc.end();

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return res.status(500).json({ status: false, message: 'Failed to generate PDF' });
    }
};