import { Complaint, User, Address, DeterminationofVigilanceAngle, DisclosureDetail, ComplaintStatusHistory } from '../models/index.js';
import { decryptClientIdNumber } from '../utils/encryption.js';
import { sendOtpMail, sendComplaintEmailToCustomer, sendDisclosureEmail } from '../utils/mailer.js';
import jwt from 'jsonwebtoken';

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

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpToken = jwt.sign({ otp, email: email_id }, process.env.JWT_SECRET, { expiresIn: '5m' });

        await sendOtpMail(email_id, otp);

        return res.status(200).json({
            success: true,
            message: 'OTP has been sent to your email',
            otp_token: otpToken
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
        const adminUser = req.user;

        const complaint = await Complaint.findByPk(id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        await ComplaintStatusHistory.create({
            complaint_id: complaint.id,
            user_id: adminUser.id,
            complaint_status,
            comment
        });

        await complaint.update({
            complaint_status,
            last_updated_by: adminUser.id
        });

        return res.status(200).json({ status: true, message: 'Data Successfully Updated' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};


export const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user', attributes: ['first_name', 'middle_name', 'last_name', 'email_id', 'mobile_no', 'gender', 'dob', 'id_type', 'id_number', 'id_photo', 'eligibility_of_whistle_blower', 'sr_number', 'organization'] },
                { model: DeterminationofVigilanceAngle, as: 'determinationofvigilanceangle', attributes: ['name'] },
                { model: DisclosureDetail, as: 'disclosureDetail', attributes: ['name', 'email'] },
                { 
                    model: ComplaintStatusHistory, 
                    as: 'complaint_status_history', 
                    include: [{ model: User, as: 'User', attributes: ['first_name', 'last_name'] }] // ✅ Yahan 'as: "User"' add kiya
                }
            ]
        });

        if (!complaint) return res.status(404).json({ status: false, message: 'Complaint not found' });

        return res.status(200).json({ status: true, data: complaint });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};