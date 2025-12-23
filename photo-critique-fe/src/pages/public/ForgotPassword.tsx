import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OtpRequestType } from "../../types/enums";
import { Button, ImageCarousel, Input, ToastType } from "../../components";
import { showToast } from "../../utils";
import { authService } from "../../services";
import { IMAGES } from "./LoginSignup";

export const ForgotPassword = () => {
  const [bgUrl, setBgUrl] = useState<string>(IMAGES[0]);
  const handleIndexChange = useCallback((i: number) => {
    setBgUrl(IMAGES[i] ?? IMAGES[0]);
  }, []);

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP modal state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingEmailForOtp, setPendingEmailForOtp] = useState<string | null>(null);

  // Reset password form state
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // resend countdown (seconds)
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const resendIntervalRef = useRef<number | null>(null);

  // start countdown when resendCountdown is set > 0
  useEffect(() => {
    if (resendCountdown > 0 && resendIntervalRef.current == null) {
      resendIntervalRef.current = window.setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            if (resendIntervalRef.current) {
              clearInterval(resendIntervalRef.current);
              resendIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000) as unknown as number;
    }

    return () => {
      // cleaning on unmount or when deps change
    };
  }, [resendCountdown]);

  // cleanup interval if modal closed or component unmount
  useEffect(() => {
    if (!showOtp && resendIntervalRef.current) {
      clearInterval(resendIntervalRef.current);
      resendIntervalRef.current = null;
      setResendCountdown(0);
    }
    return () => {
      if (resendIntervalRef.current) {
        clearInterval(resendIntervalRef.current);
        resendIntervalRef.current = null;
      }
    };
  }, [showOtp]);

  // handle forgot password
  const handleForgotPassword = async () => {
    if (loading) return;
    if (!email.trim()) {
      showToast(ToastType.ERROR, "Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setPendingEmailForOtp(email);
      setShowOtp(true);
      setOtp("");
      setResendCountdown(60);
      showToast(ToastType.SUCCESS, res);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Failed to send reset code";
      showToast(ToastType.ERROR, msg);
    } finally {
      setLoading(false);
    }
  };

  // verify OTP
  const handleVerifyOtp = async () => {
    if (otpLoading) return;
    if (!pendingEmailForOtp)
      return showToast(ToastType.ERROR, "No email to verify");
    if (!otp || otp.length < 6)
      return showToast(ToastType.ERROR, "Enter a 6-digit OTP");

    setOtpLoading(true);
    try {
      const token = await authService.verifyResetOtp({
        email: pendingEmailForOtp,
        otp,
      });
      setResetToken(token);
      setShowOtp(false);
      setOtp("");
      showToast(ToastType.SUCCESS, "OTP verified. Please enter your new password.");
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ?? err?.message ?? "OTP verification failed";
      showToast(ToastType.ERROR, msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // handle reset password
  const handleResetPassword = async () => {
    if (!resetToken) return;
    if (!newPassword || newPassword.length < 6) {
      showToast(ToastType.ERROR, "Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(ToastType.ERROR, "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        resetToken,
        newPassword,
      });
      showToast(ToastType.SUCCESS, "Password reset successfully. Please login.");
      setResetToken(null);
      setNewPassword("");
      setConfirmPassword("");
      setEmail("");
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Failed to reset password";
      showToast(ToastType.ERROR, msg);
    } finally {
      setLoading(false);
    }
  };

  // resend OTP
  const handleResendOtp = async () => {
    if (!pendingEmailForOtp)
      return showToast(ToastType.ERROR, "No email to resend OTP to");
    if (resendCountdown > 0) return;

    try {
      setResendCountdown(60);

      const res = await authService.resendOtp({
        email: pendingEmailForOtp,
        otpRequestType: OtpRequestType.FORGOT_PASSWORD,
      });
      showToast(ToastType.SUCCESS, res);
    } catch (err: any) {
      console.error(err);
      setResendCountdown(0);
      showToast(
        ToastType.ERROR,
        err?.response?.data?.message ?? "Failed to resend OTP"
      );
    }
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 -z-10 bg-center bg-cover opacity-70"
        style={{ backgroundImage: `url(${bgUrl})`, transformOrigin: "center" }}
      />

      <div className="min-h-screen flex items-center justify-center px-6 py-6 overflow-y-auto">
        <div className="w-full h-full max-w-6xl lg:w-3/5">
          <div className="bg-white rounded-4xl shadow-xl md:flex max-h-[90vh]">
            {/* FORM */}
            <div className="p-6 md:p-8 lg:px-15 lg:py-5 overflow-y-auto max-h-full hidden-scrollbar md:w-4/7 lg:w-1/2">
              <div className="flex flex-col gap-5 justify-center min-h-full">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-extrabold text-gray-900">Reset Password</h2>
                </div>

                {!resetToken ? (
                  <form
                    className="space-y-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleForgotPassword();
                    }}
                  >
                    <div>
                      <Input
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        fullWidth
                        variant="outline"
                        size="small"
                        type="email"
                        required
                      />
                    </div>

                    <p className="text-sm text-gray-500">
                      Enter your email address and we'll send you a verification code to reset your password.
                    </p>

                    <div className="pt-6">
                      <Button
                        variant="primary"
                        isLoading={loading}
                        className="w-full rounded-4xl"
                        size="medium"
                      >
                        Send Reset Code
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form
                    className="space-y-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleResetPassword();
                    }}
                  >
                    <div>
                      <Input
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        fullWidth
                        variant="outline"
                        size="small"
                        type="password"
                        required
                      />
                    </div>

                    <div>
                      <Input
                        label="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        fullWidth
                        variant="outline"
                        size="small"
                        type="password"
                        required
                      />
                    </div>

                    <div className="pt-6">
                      <Button
                        variant="primary"
                        isLoading={loading}
                        className="w-full rounded-4xl"
                        size="medium"
                      >
                        Reset Password
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* CAROUSEL */}
            <div className="hidden md:block md:flex-1">
              <div className="h-full w-full p-3">
                <ImageCarousel
                  images={IMAGES}
                  onIndexChange={handleIndexChange}
                  fitMode="cover"
                  autoPlayMs={30000}
                  hideNavigation={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-4xl p-6 flex gap-5 flex-col">
            <h2 className="text-2xl font-extrabold text-gray-900">Enter verification code</h2>
            <p className="text-gray-500 text-center">
              We sent a 6-digit code to <br></br><strong className="text-[#15B8A6]">{pendingEmailForOtp}</strong>
            </p>

            <div className="flex justify-center">
              <input
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(v);
                }}
                inputMode="numeric"
                className="px-2 text-xl font-bold text-center tracking-[7px] bg-transparent border-none outline-none focus:outline-none w-fit"
                placeholder="______"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setShowOtp(false);
                  setPendingEmailForOtp(null);
                  setOtp("");
                }}
                size="small"
              >
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleResendOtp}
                  disabled={resendCountdown > 0 || otpLoading}
                  size="small"
                >
                  {resendCountdown > 0
                    ? `Resend (${resendCountdown}s)`
                    : "Resend"}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                  size="small"
                >
                  {otpLoading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
