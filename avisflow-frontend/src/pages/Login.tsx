import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, Loader2, Mail } from "lucide-react";
import { useI18n, LangSwitcher } from "@/lib/i18n";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [notVerified, setNotVerified] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotVerified(false);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      onLogin(res.data.access_token, res.data.user);
      toast.success(t("auth.success.login"));
      navigate("/dashboard");
    } catch (err: any) {
      if (err.response?.data?.detail === "EMAIL_NOT_VERIFIED") {
        setNotVerified(true);
      } else {
        toast.error(err.response?.data?.detail || t("auth.error.login"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/api/auth/resend-verification", { email, password });
      toast.success(t("auth.verify.resent"));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("auth.error.login"));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4"><LangSwitcher /></div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">AvisFlow</span>
          </Link>
        </div>
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">{t("auth.login")}</CardTitle>
            <CardDescription>{t("auth.login.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input id="email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t("auth.submit.login")}
              </Button>
              {notVerified && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                  <Mail className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm text-amber-800 font-medium mb-1">{t("auth.verify.required")}</p>
                  <p className="text-xs text-amber-600 mb-3">{t("auth.verify.check_inbox")}</p>
                  <Button variant="outline" size="sm" onClick={handleResend} disabled={resending}>
                    {resending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                    {t("auth.verify.resend")}
                  </Button>
                </div>
              )}
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              {t("auth.no_account")}{" "}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">{t("auth.create_account")}</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
