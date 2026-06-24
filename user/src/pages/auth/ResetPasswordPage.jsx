import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { resetPasswordSchema } from "../../validations/auth.schema";

const ResetPasswordPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const submit = async () => toast.success("Password reset successfully");

  return (
    <section className="mx-auto max-w-md px-4 py-10">
      <form onSubmit={handleSubmit(submit)} className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-black">Reset Password</h1>
        <div className="mt-6 space-y-4">
          <Input label="New Password" type="password" icon={Lock} {...register("password")} error={errors.password?.message} />
          <Input label="Confirm Password" type="password" icon={Lock} {...register("confirmPassword")} error={errors.confirmPassword?.message} />
        </div>
        <Button className="mt-5 w-full" loading={isSubmitting}>Reset Password</Button>
      </form>
    </section>
  );
};

export default ResetPasswordPage;
