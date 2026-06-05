'use client';

import { useState } from 'react';

import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { ProfileMenuItem } from '@/components/profile/menu-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { BUTTON_LABELS, PROFILE_MENU_LABELS, SCREEN_TITLES } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';

export default function AthleteProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const showPaymentMethods = useFeature('savedPaymentMethods');
  const showSupport = useFeature('platformSupport');
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleSave = () => {
    updateProfile({ firstName, lastName, email });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully!');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">{SCREEN_TITLES.profile}</h1>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="font-semibold text-[var(--fn-primary)] transition hover:opacity-80"
          >
            {BUTTON_LABELS.edit}
          </button>
        ) : (
          <div className="flex gap-3">
            <Button title="Cancel" variant="outline" onClick={handleCancel} />
            <Button title="Save" onClick={handleSave} />
          </div>
        )}
      </div>

      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
        <ProfilePictureUpload
          currentAvatar={user?.avatarUri}
          onUpload={(uri) => updateProfile({ avatarUri: uri })}
          role="athlete"
          size="lg"
        />
        {isEditing ? (
          <div className="space-y-4 w-full md:w-auto">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-2xl font-extrabold">{user?.firstName} {user?.lastName}</p>
            <p className="text-base text-[var(--fn-text-muted)]">{user?.email}</p>
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] overflow-hidden">
          <ProfileMenuItem
            href="/athlete/profile/favorite-sports"
            label={PROFILE_MENU_LABELS.favoriteSports}
            value={user?.favoriteSports.length ? user.favoriteSports.join(', ') : 'None'}
          />
          <ProfileMenuItem href="/athlete/payment-history" label="Payment History" />
          {showPaymentMethods ? (
            <ProfileMenuItem href="/athlete/profile/payment-methods" label={PROFILE_MENU_LABELS.paymentMethods} />
          ) : null}
          {showSupport ? (
            <ProfileMenuItem href="/athlete/profile/support" label={PROFILE_MENU_LABELS.helpSupport} />
          ) : null}
          
          <div className="p-6 border-t border-[var(--fn-border)]">
            {!isChangingPassword ? (
              <button
                type="button"
                onClick={() => setIsChangingPassword(true)}
                className="font-semibold text-[var(--fn-primary)] transition hover:opacity-80"
              >
                Change Password
              </button>
            ) : (
              <div className="space-y-4">
                <Input 
                  label="Current Password" 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                />
                <Input 
                  label="New Password" 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                />
                <Input 
                  label="Confirm New Password" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-sm text-green-500">{passwordSuccess}</p>
                )}
                <div className="flex gap-3">
                  <Button title="Cancel" variant="outline" onClick={handleCancelPasswordChange} />
                  <Button title="Change Password" onClick={handleChangePassword} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
