import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Button from "../common/Button";
import Input from "../common/Input";
import { useAuth } from "../../context/AuthContext";
import { loginSchema, registerSchema } from "../../validations/auth.schema";

const AuthDialog = ({ open, onClose }) => {
  const [mode, setMode] = useState("login");
  const { login, register: registerUser } = useAuth();
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "user@quickdeal.com", password: "User@123456" },
  });
  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (!open) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  const submitLogin = async (values) => {
    try {
      await login(values);
      onClose();
    } catch (err) {
      toast.error(err?.message || "Invalid email or password");
    }
  };

  const submitRegister = async (values) => {
    try {
      await registerUser(values);
      onClose();
    } catch (err) {
      toast.error(err?.message || "Account could not be created");
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid min-h-screen place-items-center bg-slate-950/50 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close login register dialog" />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="auth-dialog-title" className="text-2xl font-black text-slate-950 dark:text-white">Login/Register</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Access favorites, chats, notifications, and selling tools.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" aria-label="Close dialog">
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={loginForm.handleSubmit(submitLogin)} className="mt-5">
            <div className="space-y-4">
              <Input label="Email" placeholder="Enter your email" icon={Mail} {...loginForm.register("email")} error={loginForm.formState.errors.email?.message} />
              <Input label="Password" type="password" placeholder="Enter your password" icon={Lock} {...loginForm.register("password")} error={loginForm.formState.errors.password?.message} />
            </div>
            <Button className="mt-5 w-full" loading={loginForm.formState.isSubmitting}>Login</Button>
            <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
              <button type="button" onClick={() => setMode("register")} className="font-bold text-brand-600 hover:text-brand-700">
                Register
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(submitRegister)} className="mt-5">
            <div className="space-y-4">
              <Input label="Full Name" placeholder="Enter your full name" icon={User} {...registerForm.register("name")} error={registerForm.formState.errors.name?.message} />
              <Input label="Email" placeholder="Enter your email" icon={Mail} {...registerForm.register("email")} error={registerForm.formState.errors.email?.message} />
              <Input label="Password" type="password" placeholder="Create a password" icon={Lock} {...registerForm.register("password")} error={registerForm.formState.errors.password?.message} />
            </div>
            <Button className="mt-5 w-full" loading={registerForm.formState.isSubmitting}>Create Account</Button>
            <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("login")} className="font-bold text-brand-600 hover:text-brand-700">
                Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthDialog;
