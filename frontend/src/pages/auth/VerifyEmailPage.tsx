import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../../services/authService";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader } from "../../components/ui/Card";

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;

    hasVerified.current = true;

    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setIsVerified(false);
        toast.error("Invalid verification link");
        return;
      }

      try {
        await authService.verifyEmail(token);

        setIsVerified(true);
        toast.success("Email verified successfully");
      } catch (error: any) {
        setIsVerified(false);

        toast.error(error.response?.data?.error || "Email verification failed");
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        {isVerified === null ? (
          <div className="py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-4 text-text-secondary">Verifying your email...</p>
          </div>
        ) : isVerified ? (
          <div className="py-8">
            <CardHeader
              title="Email Verified"
              subtitle="Your email has been successfully verified"
            />
            <Link to="/login">
              <Button className="w-full">Proceed to Login</Button>
            </Link>
          </div>
        ) : (
          <div className="py-8">
            <CardHeader
              title="Verification Failed"
              subtitle="The verification link is invalid or expired"
            />
            <Link to="/login">
              <Button className="w-full">Back to Login</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};
