'use client';

import { useState } from 'react';

import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { ProfileMenuItem } from '@/components/profile/menu-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterChip } from '@/components/ui/filter-chip';
import { useAuth } from '@/contexts/auth-context';
import { BUTTON_LABELS, PROFILE_MENU_LABELS, SCREEN_TITLES } from '@/constants/labels';
import { DISCIPLINES } from '@/constants/fitnexia';
import { useFeature } from '@/hooks/use-feature';

export default function AthleteProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const showPaymentMethods = useFeature('savedPaymentMethods');
  const showSupport = useFeature('platformSupport');
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(user?.avatarUri || null);
  const [editingSports, setEditingSports] = useState(false);
  const [favoriteSports, setFavoriteSports] = useState<string[]>(user?.favoriteSports ?? []);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleSave = () => {
    updateProfile({ firstName, lastName, email, avatarUri: tempAvatarUri });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
    setTempAvatarUri(user?.avatarUri || null);
    setIsEditing(false);
  };

  const handleSaveSports = () => {
    updateProfile({ favoriteSports });
    setEditingSports(false);
  };

  const handleCancelSports = () => {
    setFavoriteSports(user?.favoriteSports ?? []);
    setEditingSports(false);
  };

  const toggleSport = (sport: string) => {
    setFavoriteSports(prev => 
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
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
    <div className="flex min-h-[79vh] items-center justify-center">
      <div className="w-full max-w-3xl rounded-2xl bg-[var(--fn-surface)] p-8 shadow-lg">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center mb-8 pb-6 border-b border-[var(--fn-border)]" style={{justifyContent:"center"}}>
          <ProfilePictureUpload
            currentAvatar={isEditing ? tempAvatarUri : user?.avatarUri}
            onUpload={(uri) => setTempAvatarUri(uri)}
            role="athlete"
            size="lg"
            editable={isEditing}
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

        <div className="space-y-6 mb-8">
          {!isEditing && (
            <div className="rounded-2xl border border-[var(--fn-border)] overflow-hidden">
              {/* Favorite Sports */}
              {editingSports ? (
                <div className="p-6 border-b border-[var(--fn-border)]">
                  <p className="font-medium mb-4">{PROFILE_MENU_LABELS.favoriteSports}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {DISCIPLINES.map((s) => (
                      <FilterChip
                        key={s}
                        label={s}
                        active={favoriteSports.includes(s)}
                        onPress={() => toggleSport(s)}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button title="Cancel" variant="outline" onClick={handleCancelSports} />
                    <Button title="Save" onClick={handleSaveSports} />
                  </div>
                </div>
              ) : (
                <div className="p-6 border-b border-[var(--fn-border)] flex justify-between items-center">
                  <div>
                    <p className="font-medium">{PROFILE_MENU_LABELS.favoriteSports}</p>
                    <p className="text-sm text-[var(--fn-text-muted)]">
                      {user?.favoriteSports.length ? user.favoriteSports.join(', ') : 'None'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingSports(true)}
                    className="font-semibold text-[var(--fn-primary)] transition hover:opacity-80"
                  >
                    {BUTTON_LABELS.edit}
                  </button>
                </div>
              )}
              
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

        <div className="flex gap-3">
          {!isEditing ? (
            <Button
              title="Change"
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-[var(--fn-primary)] text-white py-3 text-lg"
            />
          ) : (
            <>
              <Button title="Cancel" variant="outline" onClick={handleCancel} className="flex-1 py-3 text-lg" />
              <Button
                title="Save Change"
                onClick={handleSave}
                className="flex-1 bg-[var(--fn-primary)] text-white py-3 text-lg"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
