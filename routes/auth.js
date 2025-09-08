import express from "express";
const router = express.Router();

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP endpoint
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const otp = generateOTP();

    // Store OTP with 5-minute expiry
    otpStore.set(email, {
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    // In development, log OTP to console instead of sending email
    console.log(`🔐 OTP for ${email}: ${otp}`);

    // TODO: In production, send actual email with OTP
    // await emailService.sendOTP({ email, otp })

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

// Verify OTP endpoint
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    if (Date.now() > storedData.expires) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP verified successfully, remove from store
    otpStore.delete(email);

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
});

export default router;