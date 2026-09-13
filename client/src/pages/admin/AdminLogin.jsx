import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Shield } from "lucide-react";
import Button from "@/components/common/Button/Button";
import Seo from "@/components/Seo";
import { adminService } from "@/services/admin.service";
import useAdminAuthStore from "@/store/adminAuthStore";
import { getErrorMessage } from "@/utils/apiError";

function AdminLogin() {
  const navigate = useNavigate();
  const setAuth = useAdminAuthStore((state) => state.setAuth);
  const token = useAdminAuthStore((state) => state.token);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await adminService.login({
        email: email.trim(),
        password,
      });

      if (data?.accessToken && data?.admin) {
        setAuth(data.accessToken, data.admin);
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError("Invalid response from authentication server.");
      }
    } catch (err) {
      setError(getErrorMessage(err) || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1f1517] px-4 py-12">
      <Seo title="Admin Login | Royal Bridal" />

      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#7d2034]/10 text-[#7d2034]">
            <Shield size={24} />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-bold text-stone-900">
            Royal Bridal Admin
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Sign in to access your store dashboard and operations.
          </p>
        </div>

        {error && (
          <div role="alert" className="mt-6 rounded-lg bg-red-50 p-3.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@royalbridal.test"
                className="w-full rounded-lg border border-stone-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#7d2034] focus:ring-1 focus:ring-[#7d2034]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-stone-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#7d2034] focus:ring-1 focus:ring-[#7d2034]"
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full mt-2 py-3 bg-[#7d2034] hover:bg-[#681a2b]"
          >
            Sign In to Portal
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-stone-400">
          Royal Bridal Management System • Protected Area
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
