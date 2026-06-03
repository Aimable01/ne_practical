import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { User, Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { updateProfileSchema, changePasswordSchema } from '../validations/authSchemas';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader } from '../components/ui/Card';

type UpdateProfileFormData = {
  firstName?: string;
  lastName?: string;
};

type ChangePasswordFormData = {
  currentPassword: string;
  newPassword: string;
};

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onProfileUpdate = async (data: UpdateProfileFormData) => {
    try {
      await authService.updateProfile(data);
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const onPasswordChange = async (data: ChangePasswordFormData) => {
    try {
      await authService.changePassword(data);
      toast.success('Password changed successfully');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Profile Settings</h1>
        
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-4 font-medium ${
                activeTab === 'profile'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`pb-3 px-4 font-medium ${
                activeTab === 'password'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Change Password
            </button>
          </div>
        </div>

        {activeTab === 'profile' && (
          <Card>
            <CardHeader title="Personal Information" subtitle="Update your personal details" />
            <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
              <Input
                label="First Name"
                placeholder="Enter your first name"
                error={profileErrors.firstName?.message}
                {...registerProfile('firstName')}
              />
              <Input
                label="Last Name"
                placeholder="Enter your last name"
                error={profileErrors.lastName?.message}
                {...registerProfile('lastName')}
              />
              <Input
                label="Email"
                type="email"
                value={user?.email}
                disabled
                className="bg-gray-100"
              />
              <Input
                label="Role"
                value={user?.role}
                disabled
                className="bg-gray-100"
              />
              <div className="flex items-center space-x-2">
                {user?.isEmailVerified ? (
                  <span className="text-green-600 text-sm flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email Verified
                  </span>
                ) : (
                  <span className="text-yellow-600 text-sm flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email Not Verified
                  </span>
                )}
              </div>
              <Button type="submit" isLoading={isProfileSubmitting}>
                Update Profile
              </Button>
            </form>
          </Card>
        )}

        {activeTab === 'password' && (
          <Card>
            <CardHeader title="Change Password" subtitle="Update your password" />
            <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter your current password"
                error={passwordErrors.currentPassword?.message}
                {...registerPassword('currentPassword')}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Enter your new password"
                error={passwordErrors.newPassword?.message}
                {...registerPassword('newPassword')}
              />
              <Button type="submit" isLoading={isPasswordSubmitting}>
                Change Password
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};
