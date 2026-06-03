import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authService } from "../../services/authService";
import { resetPasswordSchema } from "../../validations/authSchemas";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardHeader } from "../../components/ui/Card";

type ResetPasswordFormData = {
  newPassword: string;
};

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setIsTokenValid(false);
      toast.error("Invalid reset token");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    try {
      await authService.resetPassword({
        token,
        newPassword: data.newPassword,
      });

      toast.success(
        "Password reset successful. Please login with your new password.",
      );

      navigate("/login");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to reset password",
      );
    }
  };

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader
            title="Invalid Token"
            subtitle="The reset token is invalid or expired"
          />
          <Link to="/forgot-password">
            <Button className="w-full">Request New Reset Link</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader title="Reset Password" subtitle="Enter your new password" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="Enter your new password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Reset Password
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary">
          Remember your password?{" "}
          <Link to="/login" className="text-brand-primary hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};
