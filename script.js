document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const otpInput = document.getElementById('otp');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const resendOtpBtn = document.getElementById('resend-otp');
    const phoneForm = document.getElementById('phone-form');
    const otpForm = document.getElementById('otp-form');
    const phoneError = document.getElementById('phone-error');
    const otpError = document.getElementById('otp-error');
    const otpSuccess = document.getElementById('otp-success');
    
    // MSG91 API configuration
    const msg91Config = {
        authKey: "445998AZcfKTtlaD67f3979eP1", // Replace with your MSG91 auth key
        templateId: "67f3a23ad6fc053d6d1c4412", // Replace with your MSG91 template ID
        otpExpiry: 5, // OTP expiry in minutes
        otpLength: 6 // OTP length
    };
    
    let currentPhoneNumber = '';
    let otpSent = false;
    
    // Send OTP button click handler
    sendOtpBtn.addEventListener('click', function() {
        const phoneNumber = phoneInput.value.trim();
        
        if (!validatePhoneNumber(phoneNumber)) {
            phoneError.textContent = 'Please enter a valid 10-digit mobile number';
            return;
        }
        
        phoneError.textContent = '';
        currentPhoneNumber = phoneNumber;
        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = 'Sending OTP...';
        
        // Call MSG91 API to send OTP
        sendOTP(phoneNumber)
            .then(response => {
                if (response.type === 'success') {
                    otpSent = true;
                    phoneForm.style.display = 'none';
                    otpForm.style.display = 'block';
                    otpSuccess.textContent = 'OTP sent successfully!';
                    setTimeout(() => {
                        otpSuccess.textContent = '';
                    }, 3000);
                } else {
                    phoneError.textContent = response.message || 'Failed to send OTP';
                }
            })
            .catch(error => {
                phoneError.textContent = 'Error sending OTP. Please try again.';
                console.error('Error sending OTP:', error);
            })
            .finally(() => {
                sendOtpBtn.disabled = false;
                sendOtpBtn.textContent = 'Send OTP';
            });
    });
    
    // Verify OTP button click handler
    verifyOtpBtn.addEventListener('click', function() {
        const otp = otpInput.value.trim();
        
        if (!validateOTP(otp)) {
            otpError.textContent = 'Please enter a valid 6-digit OTP';
            return;
        }
        
        otpError.textContent = '';
        verifyOtpBtn.disabled = true;
        verifyOtpBtn.textContent = 'Verifying...';
        
        // Call MSG91 API to verify OTP
        verifyOTP(currentPhoneNumber, otp)
            .then(response => {
                if (response.type === 'success') {
                    otpSuccess.textContent = 'OTP verified successfully!';
                    // On successful verification, you would typically:
                    // 1. Create/login user on your backend
                    // 2. Set authentication tokens
                    // 3. Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = '/dashboard'; // Redirect to dashboard
                    }, 1000);
                } else {
                    otpError.textContent = response.message || 'Invalid OTP. Please try again.';
                }
            })
            .catch(error => {
                otpError.textContent = 'Error verifying OTP. Please try again.';
                console.error('Error verifying OTP:', error);
            })
            .finally(() => {
                verifyOtpBtn.disabled = false;
                verifyOtpBtn.textContent = 'Verify OTP';
            });
    });
    
    // Resend OTP handler
    resendOtpBtn.addEventListener('click', function() {
        if (!currentPhoneNumber) return;
        
        otpError.textContent = '';
        otpInput.value = '';
        verifyOtpBtn.disabled = false;
        
        // Call MSG91 API to resend OTP
        sendOTP(currentPhoneNumber)
            .then(response => {
                if (response.type === 'success') {
                    otpSuccess.textContent = 'OTP resent successfully!';
                    setTimeout(() => {
                        otpSuccess.textContent = '';
                    }, 3000);
                } else {
                    otpError.textContent = response.message || 'Failed to resend OTP';
                }
            })
            .catch(error => {
                otpError.textContent = 'Error resending OTP. Please try again.';
                console.error('Error resending OTP:', error);
            });
    });
    
    // Input validation functions
    function validatePhoneNumber(phone) {
        return /^\d{10}$/.test(phone);
    }
    
    function validateOTP(otp) {
        return /^\d{6}$/.test(otp);
    }
    
    // Function to send OTP using MSG91 API
    async function sendOTP(phoneNumber) {
        const countryCode = '91'; // India - change as needed
        const fullNumber = `${countryCode}${phoneNumber}`;
        
        try {
            const response = await fetch('https://api.msg91.com/api/v5/otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authkey': msg91Config.authKey
                },
                body: JSON.stringify({
                    template_id: msg91Config.templateId,
                    mobile: fullNumber,
                    otp_expiry: msg91Config.otpExpiry,
                    otp_length: msg91Config.otpLength
                })
            });
            
            const data = await response.json();
            
            if (data.type === 'success') {
                return { type: 'success', message: data.message };
            } else {
                return { type: 'error', message: data.message || 'Failed to send OTP' };
            }
        } catch (error) {
            console.error('Error in sendOTP:', error);
            return { type: 'error', message: 'Network error. Please try again.' };
        }
    }
    
    // Function to verify OTP using MSG91 API
    async function verifyOTP(phoneNumber, otp) {
        const countryCode = '91'; // India - change as needed
        const fullNumber = `${countryCode}${phoneNumber}`;
        
        try {
            const response = await fetch(`https://api.msg91.com/api/v5/otp/verify?mobile=${fullNumber}&otp=${otp}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authkey': msg91Config.authKey
                }
            });
            
            const data = await response.json();
            
            if (data.type === 'success') {
                return { type: 'success', message: data.message };
            } else {
                return { type: 'error', message: data.message || 'Invalid OTP' };
            }
        } catch (error) {
            console.error('Error in verifyOTP:', error);
            return { type: 'error', message: 'Network error. Please try again.' };
        }
    }
});