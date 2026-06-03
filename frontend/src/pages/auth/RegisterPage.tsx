import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { registerSchema } from '../../validations/authSchemas';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardHeader } from '../../components/ui/Card';

type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'INSPECTOR' | 'USER';
};

const roleOptions = [
  { value: 'USER', label: 'User' },
  { value: 'INSPECTOR', label: 'Inspector' },
  { value: 'ADMIN', label: 'Admin' },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      toast.success('Registration successful. Please check your email to verify your account.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader title="Create Account" subtitle="Sign up to get started" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="First Name"
            placeholder="Enter your first name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
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
            placeholder="Create a password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Select
            label="Role"
            options={roleOptions}
            error={errors.role?.message}
            {...register('role')}
          />
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            <UserPlus className="w-4 h-4 mr-2" />
            Sign Up
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-primary hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};
