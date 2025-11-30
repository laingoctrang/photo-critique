import { useCallback, useEffect, useRef, useState } from "react";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { OtpRequestType } from "../../types/enums";
import { ImageCarousel, Input, ToastType } from "../../components";
import { useAuth } from "../../hooks";
import { showToast } from "../../utils";

const imageModules = import.meta.glob("../../assets/images/auth/bg/*", {
  eager: true,
  query: "?url",
});

export const IMAGES = Object.values(imageModules).map(
  (module) => module.default
);

export const Login = () => {
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

  // OTP modal state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(""); // e.g. "1234"
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
      // (we only clear interval when component unmounts; also handled above when reaches 0)
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
        navigate("/", { replace: true });
        showToast(ToastType.SUCCESS, res.message || "Login successful");
        return;
      }

      // signup flow
      const res = await authService.register({
        fullName,
        username,
        email,
        password,
      });

      // register() in your api returns a message string — so no token here.
      // open OTP modal and start resend timer
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
      return showToast(ToastType.ERROR, "Enter a 4-digit OTP");

    setOtpLoading(true);
    try {
      // your verifyRegistration expects full payload per your types: VerifyRegisterData
      // It expects username,email,password,fullName,otp
      // We preserved username/fullName/password from form state (from signup flow)
      const verifyPayload = {
        username: username || "", // ensure non-null (backend should validate)
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
      navigate("/", { replace: true });
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
  const handleResendOtp = async () => {
    if (!pendingEmailForOtp)
      return showToast(ToastType.ERROR, "No email to resend OTP to");
    if (resendCountdown > 0) return; // throttle, should be disabled in UI anyway

    try {
      // start cooldown immediately to avoid repeated clicks
      setResendCountdown(60);

      const res = await authService.resendOtp({
        email: pendingEmailForOtp,
        otpRequestType: OtpRequestType.REGISTER,
      });
      showToast(ToastType.SUCCESS, res);
    } catch (err: any) {
      console.error(err);
      // stop countdown on failure so user can try again (optional)
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
        <div className="w-full max-w-6xl">
          <div className="bg-white rounded-4xl shadow-xl overflow-hidden flex max-h-[90vh]">
            {/* FORM */}
            <div className="p-6 md:p-8 lg:p-10 flex-[0.4] flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {mode === "login" ? "Welcome back" : "Create an account"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {mode === "login"
                      ? "Sign in to continue"
                      : "Sign up to join the community"}
                  </p>
                </div>
              </div>

              <form
                className="mt-6 space-y-4"
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
                    size="medium"
                  />
                )}

                {mode === "signup" && (
                  <Input
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose username"
                    fullWidth
                    variant="outline"
                    size="medium"
                  />
                )}

                <div>
                  <Input
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    fullWidth
                    variant="outline"
                    size="medium"
                    type="email"
                  />
                </div>

                <div>
                  <Input
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    fullWidth
                    variant="outline"
                    size="medium"
                    type="password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"> 
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setMode((m) => (m === "login" ? "signup" : "login"))
                      }
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      {mode === "login"
                        ? "Create account"
                        : "Have an account? Login"}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-indigo-600 disabled:opacity-60 hover:bg-indigo-700 text-white py-2 font-medium"
                  >
                    {loading
                      ? mode === "login"
                        ? "Logging in..."
                        : "Signing up..."
                      : mode === "login"
                      ? "Login"
                      : "Sign up"}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-sm text-gray-500 text-center">
                By continuing you agree to our{" "}
                <a className="text-indigo-600 hover:underline" href="#">
                  Terms
                </a>
                .
              </div>
            </div>

            {/* CAROUSEL */}
            <div className="hidden md:block md:flex-[0.6] h-full">
              <div className="h-full w-full p-3">
                <ImageCarousel
                  images={IMAGES}
                  onIndexChange={handleIndexChange}
                  fitMode="cover"
                  autoPlayMs={30000}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold">Enter verification code</h3>
            <p className="text-sm text-gray-500 mt-1">
              We sent a 6-digit code to <strong>{pendingEmailForOtp}</strong>
            </p>

            <div className="mt-4 flex items-center justify-center">
              <input
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(v);
                }}
                inputMode="numeric"
                className="w-40 text-center text-xl tracking-wider rounded-md border border-gray-200 px-3 py-2"
                placeholder="______"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowOtp(false);
                  setPendingEmailForOtp(null);
                }}
                className="text-sm text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResendOtp}
                  disabled={resendCountdown > 0 || otpLoading}
                  className="text-sm text-indigo-600 hover:underline disabled:opacity-40"
                >
                  {resendCountdown > 0
                    ? `Resend (${resendCountdown}s)`
                    : "Resend"}
                </button>

                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                  className="ml-2 rounded-md bg-indigo-600 disabled:opacity-60 hover:bg-indigo-700 text-white py-2 px-4"
                >
                  {otpLoading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
