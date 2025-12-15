import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks";
import { showToast } from "../../utils";
import { ToastType, Loading } from "../../components";

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) return;

    // Read params directly from URL to avoid dependency issues
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");
    const message = urlParams.get("message");

    // Mark as processed immediately
    hasProcessed.current = true;

    // Clean URL first to prevent re-renders
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

    if (error) {
      showToast(ToastType.ERROR, decodeURIComponent(error) || "OAuth authentication failed");
      navigate("/login", { replace: true });
      return;
    }

    if (token) {
      login(token);
      navigate("/");
      if (message) {
        showToast(ToastType.SUCCESS, decodeURIComponent(message));
      }
      return;
    }

    // No token and no error - redirect to login
    navigate("/login", { replace: true });
  }, []); // Only run once on mount

  return (
    <div className="flex items-center justify-center h-screen">
      <Loading variant="fullscreen" text="Completing authentication..." />
    </div>
  );
};

