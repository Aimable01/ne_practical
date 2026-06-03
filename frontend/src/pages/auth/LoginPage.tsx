import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema } from '../../validations/authSchemas';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader } from '../../components/ui/Card';

type LoginFormData = {
  email: string;
  password: string;
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader title="Welcome Back" subtitle="Sign in to your account" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-brand-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-primary hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
};
