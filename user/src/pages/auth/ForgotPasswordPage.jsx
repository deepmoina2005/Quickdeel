import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { forgotPasswordSchema } from "../../validations/auth.schema";

const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const submit = async () => toast.success("Reset link sent");

  return (
    <section className="mx-auto max-w-md px-4 py-10">
      <form onSubmit={handleSubmit(submit)} className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-black">Forgot Password</h1>
        <p className="mt-2 text-sm text-slate-500">Enter your email to receive a reset link.</p>
        <div className="mt-6"><Input label="Email" icon={Mail} {...register("email")} error={errors.email?.message} /></div>
        <Button className="mt-5 w-full" loading={isSubmitting}>Send Reset Link</Button>
      </form>
    </section>
  );
};

export default ForgotPasswordPage;
