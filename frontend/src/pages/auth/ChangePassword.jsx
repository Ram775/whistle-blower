import React, { useState, useEffect } from "react";
import { Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, CircleAlert, ShieldCheck } from "lucide-react";
import { authService } from "../../services/authService"; // 2nd code ka path
import { notify } from "../../utils/notify";


const ChangePassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const newPasswordValue = Form.useWatch("new_password", form);

  useEffect(() => {
    const pass = newPasswordValue || "";
    setChecks({
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[@#$&]/.test(pass),
    });
  }, [newPasswordValue]);

  // Character filter logic
  const handleKeyPress = (e) => {
    const allowedRegex = /^[A-Za-z0-9@#$&]$/;
    if (e.key.length === 1 && !allowedRegex.test(e.key)) {
      e.preventDefault();
      notify.error("Only alphanumeric and @ # $ & characters allowed");
    }
  };

  // Prevent Paste/Copy
  const handlePaste = (e) => {
    e.preventDefault();
    notify.error("Copy/Paste is not allowed");
  };

  // 2nd code wala logic (API Payload)
  const onFinish = async (values) => {
    if (!Object.values(checks).every(Boolean)) {
      notify.error("Please fulfill all password requirements!");
      return;
    }

    setLoading(true);
    try {
      // 2nd code ke hisaab se payload
      const payload = {
        old_password: values.old_password,
        new_password: values.new_password,
        confirm_new_password: values.confirm_new_password,
      };

      const response = await authService.changePassword(payload);

      // Agar API success status deti hai (2nd code ke hisaab se)
      if (response.status) {
        notify.success("Password updated successfully!");
        form.resetFields(); // Form clear karo
        // Successful change ke baad navigate karna ho toh kar sakte hain
        // navigate("/admin/dashboard");
      }
    } catch (error) {
      notify.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const ValidationItem = ({ label, isMet }) => (
    <div
      className={`flex items-center gap-2 text-[11px] sm:text-xs transition-all duration-300 ${
        isMet ? "text-green-600" : "text-gray-400"
      }`}
    >
      {isMet ? (
        <CheckCircle2 size={14} className="shrink-0" />
      ) : (
        <Circle size={14} className="shrink-0 opacity-50" />
      )}
      <span className={isMet ? "font-semibold" : "font-normal"}>{label}</span>
    </div>
  );

  return (
    <div className="flex justify-center items-center p-2 sm:p-4 min-h-[80vh]">
      <div className="app_card w-full sm:max-w-xl md:max-w-3xl overflow-hidden shadow-lg rounded-xl transition-all">
        {/* Header - Same as First Code */}
        <div className="card_header p-4 md:p-6 bg-[#1E3A8A] text-white font-bold uppercase tracking-wide gap-3">
          <ShieldCheck size={20} className="hidden xs:block" />
          <div className="flex items-center justify-between">
            <h2>Change Password</h2>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 bg-white">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            autoComplete="off"
          >
            {/* Old Password (2nd code ke hisaab se name="old_password") */}
            <Form.Item
              label={
                <span className="form_label font-semibold text-sm md:text-base">
                  Old Password
                </span>
              }
              name="old_password"
              rules={[
                {
                  required: true,
                  message: (
                    <span className="flex items-center mt-1 gap-1">
                      <CircleAlert size={16} /> Old password is required
                    </span>
                  ),
                },
              ]}
            >
              <Input.Password
                placeholder="Enter your old password"
                maxLength={30}
                onKeyDown={handleKeyPress}
                onPaste={handlePaste}
                onCopy={handlePaste}
                onCut={handlePaste}
                className="form_input h-10 md:h-12 rounded-lg"
              />
            </Form.Item>

            {/* New Password (2nd code ke hisaab se name="new_password") */}
            <Form.Item
              label={
                <span className="form_label font-semibold text-sm md:text-base">
                  New Password
                </span>
              }
              name="new_password"
              rules={[
                {
                  required: true,
                  message: (
                    <span className="flex items-center mt-1 gap-1">
                      <CircleAlert size={16} /> New password is required
                    </span>
                  ),
                },
                {
                  pattern: /^[A-Za-z0-9@#$&]{8,}$/,
                  message: (
                    <span className="flex items-center mt-1 gap-1 text-xs">
                      <CircleAlert size={14} /> Password must be at least 8
                      characters with only alphanumeric and @ # $ &
                    </span>
                  ),
                },
              ]}
              hasFeedback
            >
              <Input.Password
                maxLength={30}
                onKeyDown={handleKeyPress}
                onPaste={handlePaste}
                onCopy={handlePaste}
                onCut={handlePaste}
                placeholder="Enter new password"
                className="form_input h-10 md:h-12 rounded-lg"
              />
            </Form.Item>

            {/* Validation Grid - Same UI */}
            {newPasswordValue && newPasswordValue.length > 0 && (
              <div className="mt-[-10px] mb-6 p-4 bg-slate-50 rounded-xl border border-gray-100 shadow-inner animate-in fade-in zoom-in duration-300">
                <div className="grid grid-cols-2 xs:grid-cols-2 gap-x-4 gap-y-2">
                  <ValidationItem label="8+ Characters" isMet={checks.length} />
                  <ValidationItem
                    label="1 Uppercase (A-Z)"
                    isMet={checks.uppercase}
                  />
                  <ValidationItem
                    label="1 Number (0-9)"
                    isMet={checks.number}
                  />
                  <ValidationItem
                    label="Special (@#$&)"
                    isMet={checks.special}
                  />
                </div>
                {/* Progress bar */}
                <div className="mt-4 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      Object.values(checks).filter(Boolean).length === 4
                        ? "bg-green-500 w-full"
                        : Object.values(checks).filter(Boolean).length >= 2
                          ? "bg-amber-400 w-1/2"
                          : "bg-red-400 w-1/4"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Confirm Password (2nd code ke hisaab se name="confirm_new_password") */}
            <Form.Item
              label={
                <span className="form_label font-semibold text-sm md:text-base">
                  Confirm New Password
                </span>
              }
              name="confirm_new_password"
              dependencies={["new_password"]}
              rules={[
                {
                  required: true,
                  message: (
                    <span className="flex items-center mt-1 gap-1">
                      <CircleAlert size={16} /> Please confirm your password
                    </span>
                  ),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("new_password") === value)
                      return Promise.resolve();
                    return Promise.reject(
                      <span className="flex items-center mt-1 gap-1 text-xs text-red-500">
                        <CircleAlert size={14} /> The two passwords do not
                        match!
                      </span>,
                    );
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password
                maxLength={30}
                onKeyDown={handleKeyPress}
                onPaste={handlePaste}
                onCopy={handlePaste}
                onCut={handlePaste}
                placeholder="Confirm new password"
                className="form_input h-10 md:h-12 rounded-lg"
              />
            </Form.Item>

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer btn_base btn_primary w-full sm:w-auto sm:px-24 h-12 border-none flex items-center justify-center font-bold rounded-lg transition-all active:scale-95 shadow-md disabled:opacity-50"
              >
                {loading ? "Changing..." : "Update Password"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
