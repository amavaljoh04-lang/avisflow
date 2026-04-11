import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, Loader2 } from "lucide-react";
import { useI18n, LangSwitcher } from "@/lib/i18n";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface RegisterProps {
  onLogin: (token: string, user: any) => void;
}

export default function Register({ onLogin }: RegisterProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(t("auth.error.password"));
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", { email, password, full_name: fullName });
      onLogin(res.data.access_token, res.data.user);
      toast.success(t("auth.success.register"));
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("auth.error.register"));
    } finally {
      setLoading(false);
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
            <CardTitle className="text-2xl">{t("auth.register")}</CardTitle>
            <CardDescription>{t("auth.register.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("auth.fullname")}</Label>
                <Input id="name" placeholder="Jean Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input id="email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input id="password" type="password" placeholder={t("auth.password.min")} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t("auth.submit.register")}
              </Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              {t("auth.has_account")}{" "}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">{t("auth.go_login")}</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
