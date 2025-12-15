import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OtpRequestType } from "../../types/enums";
import { Button, Checkbox, ImageCarousel, Input, ToastType } from "../../components";
import { useAuth } from "../../hooks";
import { showToast } from "../../utils";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { authService, oAuthService } from "../../services";

const imageModules = import.meta.glob("../../assets/images/auth/bg/*", {
  eager: true,
  query: "?url",
});

export const IMAGES = Object.values(imageModules).map(
  (module: any) => module.default
);

export const LoginSignup = () => {
  const [bgUrl, setBgUrl] = useState<string>(IMAGES[0]);
  const handleIndexChange = useCallback((i: number) => {
    setBgUrl(IMAGES[i] ?? IMAGES[0]);
  }, []);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");

  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  // OTP modal state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingEmailForOtp, setPendingEmailForOtp] = useState<string | null>(
    null
  );

  // resend countdown (seconds)
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const resendIntervalRef = useRef<number | null>(null);

  // start countdown when resendCountdown is set > 0
  useEffect(() => {
    // if countdown already running, do nothing
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

  // handle submit for both login & signup
  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await authService.login({ email, password });
        const token = (res as any)?.accessToken ?? (res as any)?.token ?? null;
        if (!token) throw new Error("No token returned from server");
        // save via context
        login(token);
        navigate("/");
        showToast(ToastType.SUCCESS, res.message || "Login successful");
        return;
      }

      // signup flow
      const res = await authService.register({ fullName, username, email, password });
      setPendingEmailForOtp(email);
      setShowOtp(true);
      setOtp("");
      setResendCountdown(60); // start 60s cooldown before resend allowed
      showToast(ToastType.SUCCESS, res);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Something went wrong";
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
      const verifyPayload = {
        username: username || "",
        email: pendingEmailForOtp,
        password: password || "",
        fullName: fullName || "",
        otp,
      };
      const res = await authService.verifyRegistration(verifyPayload);
      const token = res?.accessToken ?? (res as any)?.token ?? null;

      if (!token) {
        // If verify succeeded but backend doesn't return token, inform user and close
        showToast(ToastType.SUCCESS, "Verification successful. Please login.");
        setShowOtp(false);
        setPendingEmailForOtp(null);
        setOtp("");
        setMode("login");
        return;
      }

      // If token returned -> login and navigate home
      login(token);
      setShowOtp(false);
      setPendingEmailForOtp(null);
      setOtp("");
      navigate("/");
      showToast(ToastType.SUCCESS, res.message || "Verification & login successful");
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "OTP verification failed";
      showToast(ToastType.ERROR, msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // resend OTP (disabled until resendCountdown === 0)
  const handleResendOtp = async (otpRequestType: OtpRequestType) => {
    if (!pendingEmailForOtp)
      return showToast(ToastType.ERROR, "No email to resend OTP to");
    if (resendCountdown > 0) return;

    try {
      // start cooldown immediately to avoid repeated clicks
      setResendCountdown(60);

      const res = await authService.resendOtp({
        email: pendingEmailForOtp,
        otpRequestType: otpRequestType,
      });
      showToast(ToastType.SUCCESS, res);
    } catch (err: any) {
      console.error(err);
      // stop countdown on failure so user can try again
      setResendCountdown(0);
      showToast(
        ToastType.ERROR,
        err?.response?.data?.message ?? "Failed to resend OTP"
      );
    }
  };

  const handleRedirectToProvider = async (provider: 'google' | 'facebook') => {
    try {
      if (provider === 'google') {
        setGoogleLoading(true);
      } else {
        setFacebookLoading(true);
      }
      // open new window to redirect to provider
      await oAuthService.redirectToProvider(provider);
    } catch (error: any) {
      showToast(ToastType.ERROR, error?.message || `Failed to connect with ${provider}`);
    } finally {
      if (provider === 'google') {
        setGoogleLoading(false);
      } else {
        setFacebookLoading(false);
      }
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
                  <h2 className="text-4xl font-extrabold text-gray-900">
                    {mode === "login" ? "Welcome Back" : "Create Account"}
                  </h2>
                </div>

                <form
                  className="space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                >
                  {mode === "signup" && (
                    <Input
                      label="Full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name"
                      fullWidth
                      variant="outline"
                      size="small"
                      required
                    />
                  )}

                  {mode === "signup" && (
                    <Input
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      fullWidth
                      variant="outline"
                      size="small"
                      required
                    />
                  )}

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

                  <div>
                    <Input
                      label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      fullWidth
                      variant="outline"
                      size="small"
                      type="password"
                      required
                    />
                  </div>

                  {
                    mode === "login" && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            label="Remember me"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            fullWidth
                            size="small"
                          />
                        </div>
                        <div className="mt-2 text-right">
                          <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            className="text-sm text-[#15B8A6] hover:text-[#0fa192] hover:underline transition-colors cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        </div>
                      </div>
                    )
                  }

                  <div className="pt-6">
                    <Button
                      variant="primary"
                      isLoading={loading}
                      className="w-full rounded-4xl"
                      size="medium"
                    >
                      {mode === "login" ? "Login" : "Sign up"}
                    </Button>
                  </div>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-gray-500 font-medium text-xs">
                      OR
                    </span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <Button
                    variant="secondary"
                    leftIcon={FcGoogle}
                    isLoading={googleLoading}
                    className="w-full"
                    onClick={() => handleRedirectToProvider('google')}
                    size="small"
                  >
                    Google
                  </Button>

                  <Button
                    variant="secondary"
                    leftIcon={({ className }) => <FaFacebookF className={`${className} text-blue-600`} />}
                    isLoading={facebookLoading}
                    className="w-full"
                    onClick={() => handleRedirectToProvider('facebook')}
                    size="small"
                  >
                    Facebook
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {mode === "login"
                      ? "Don't have an account? "
                      : "Already have an account? "}
                    <button
                      type="button"
                      onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
                      className="text-[#15B8A6] font-semibold hover:text-[#0fa192] hover:underline cursor-pointer ml-1"
                    >
                      {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                  </p>
                </div>
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
                className="px-2 text-3xl text-center tracking-[7px] bg-transparent border-none outline-none focus:outline-none w-fit"
                placeholder="______"
              />
            </div>


            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setShowOtp(false);
                  setPendingEmailForOtp(null);
                }}
                size="small"
              >
                Cancel
              </Button>
              <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleResendOtp(OtpRequestType.REGISTER)}
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
}
