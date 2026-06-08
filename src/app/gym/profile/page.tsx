'use client';

import { useState } from 'react';

import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { PhotoGallery } from '@/components/profile/PhotoGallery';
import { ProfileMenuItem } from '@/components/profile/menu-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { BUTTON_LABELS, PROFILE_MENU_LABELS, SCREEN_TITLES, GENERAL_LABELS } from '@/constants/labels';

export default function GymProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.institutionProfile?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(user?.avatarUri || null);
  const [tempGallery, setTempGallery] = useState<string[]>(user?.institutionProfile?.gallery ?? []);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleSave = () => {
    updateProfile({ 
      email, 
      avatarUri: tempAvatarUri,
      institutionProfile: { 
        ...user?.institutionProfile, 
        name,
        gallery: tempGallery
      } 
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(user?.institutionProfile?.name || '');
    setEmail(user?.email || '');
    setTempAvatarUri(user?.avatarUri || null);
    setTempGallery(user?.institutionProfile?.gallery ?? []);
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError(GENERAL_LABELS.newPasswordsDoNotMatch);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(GENERAL_LABELS.passwordChangedSuccessfully);
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : GENERAL_LABELS.failedToChangePassword);
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
            role="institution"
            size="lg"
            editable={isEditing}
          />
          {isEditing ? (
            <div className="space-y-4 w-full md:w-auto">
              <Input label="Nombre del gimnasio" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label={GENERAL_LABELS.email} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-2xl font-extrabold">{user?.institutionProfile?.name}</p>
              <p className="text-base text-[var(--fn-text-muted)]">{user?.email}</p>
            </div>
          )}
        </div>

        <div className="space-y-6 mb-8">
          {/* Photo Gallery */}
          <div className="rounded-2xl border border-[var(--fn-border)] p-6">
            <h2 className="mb-4 text-lg font-bold">{PROFILE_MENU_LABELS.photoGallery}</h2>
            <PhotoGallery
              images={isEditing ? tempGallery : (user?.institutionProfile?.gallery ?? [])}
              editable={isEditing}
              onAddImage={(uri) =>
                setTempGallery([...tempGallery, uri])
              }
              onRemoveImage={(idx) =>
                setTempGallery(tempGallery.filter((_, i) => i !== idx))
              }
            />
          </div>

          {/* Menu Items */}
          {!isEditing && (
            <div className="rounded-2xl border border-[var(--fn-border)] overflow-hidden">
              <ProfileMenuItem href="/gym/profile/instructors" label={PROFILE_MENU_LABELS.instructors} />
              <ProfileMenuItem href="/gym/profile/plan" label={PROFILE_MENU_LABELS.planCommission} />
              
              <div className="p-6 border-t border-[var(--fn-border)]">
                {!isChangingPassword ? (
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(true)}
                    className="font-semibold text-[var(--fn-primary)] transition hover:opacity-80"
                  >
                    {GENERAL_LABELS.changePassword}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <Input 
                      label={GENERAL_LABELS.currentPassword} 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                    />
                    <Input 
                      label={GENERAL_LABELS.newPassword} 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                    />
                    <Input 
                      label={GENERAL_LABELS.confirmNewPassword} 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                    {passwordError && (
                      <p className="text-sm text-red-500">{passwordError}</p>
                    )}
                    {passwordSuccess && (
                      <p className="text-sm text-blue-500">{passwordSuccess}</p>
                    )}
                    <div className="flex gap-3">
                      <Button title={GENERAL_LABELS.cancel} variant="outline" onClick={handleCancelPasswordChange} />
                      <Button title={GENERAL_LABELS.changePassword} onClick={handleChangePassword} />
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
              title={GENERAL_LABELS.change}
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-[var(--fn-primary)] text-white py-3 text-lg"
            />
          ) : (
            <>
              <Button title={GENERAL_LABELS.cancel} variant="outline" onClick={handleCancel} className="flex-1 py-3 text-lg" />
              <Button
                title={GENERAL_LABELS.saveChange}
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
