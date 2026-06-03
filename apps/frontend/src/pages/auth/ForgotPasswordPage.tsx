import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authService } from "../../services/authService";
import { forgotPasswordSchema } from "../../validations/authSchemas";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardHeader } from "../../components/ui/Card";

type ForgotPasswordFormData = {
  email: string;
};

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    console.log("Forgot password form submitted:", data);
    try {
      await authService.forgotPassword(data);
      toast.success(
        "If an account with that email exists, a password reset link has been sent.",
      );
      navigate("/login");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.error || "Failed to send reset link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader
          title="Forgot Password"
          subtitle="Enter your email to receive a password reset link"
        />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full"
            onClick={() => {
              console.log("Button clicked");
            }}
          >
            Send Reset Link
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
