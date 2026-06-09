'use client';

import { useState } from 'react';
import { Circle, CircleCheck } from 'lucide-react';
import type { Certification } from '@/types/api';

import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { ProfileMenuItem } from '@/components/profile/menu-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { useAuth } from '@/contexts/auth-context';
import { BUTTON_LABELS, PROFILE_MENU_LABELS, SCREEN_TITLES, GENERAL_LABELS, DISCIPLINE_LABELS } from '@/constants/labels';
import { DISCIPLINES } from '@/constants/fitnexia';

export default function InstructorProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.instructorProfile?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(user?.avatarUri || null);
  const [editingCertifications, setEditingCertifications] = useState(false);
  const [editingFavoriteSports, setEditingFavoriteSports] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>(
    user?.instructorProfile?.certifications ?? []
  );
  const [favoriteSports, setFavoriteSports] = useState<string[]>(user?.favoriteSports ?? []);
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertYear, setNewCertYear] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const profile = user?.instructorProfile;

  const handleSave = () => {
    updateProfile({ 
      email, 
      avatarUri: tempAvatarUri,
      instructorProfile: { ...user?.instructorProfile, displayName } 
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDisplayName(user?.instructorProfile?.displayName || '');
    setEmail(user?.email || '');
    setTempAvatarUri(user?.avatarUri || null);
    setIsEditing(false);
  };

  const handleSaveFavoriteSports = () => {
    updateProfile({ favoriteSports });
    setEditingFavoriteSports(false);
  };

  const handleCancelFavoriteSports = () => {
    setFavoriteSports(user?.favoriteSports ?? []);
    setEditingFavoriteSports(false);
  };

  const handleSaveCertifications = () => {
    updateProfile({ instructorProfile: { ...user?.instructorProfile, certifications } });
    setEditingCertifications(false);
  };

  const handleCancelCertifications = () => {
    setCertifications(user?.instructorProfile?.certifications ?? []);
    setNewCertName('');
    setNewCertIssuer('');
    setNewCertYear('');
    setEditingCertifications(false);
  };

  const handleAddCertification = () => {
    if (newCertName && newCertIssuer && newCertYear) {
      setCertifications([
        ...certifications,
        { name: newCertName, issuer: newCertIssuer, year: parseInt(newCertYear) }
      ]);
      setNewCertName('');
      setNewCertIssuer('');
      setNewCertYear('');
    }
  };

  const handleRemoveCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
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
      <div className="fn-layout-profile w-full rounded-2xl bg-[var(--fn-surface)] p-8 shadow-lg">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center mb-8 pb-6 border-b border-[var(--fn-border)]" style={{justifyContent:"center"}}>
          <ProfilePictureUpload
            currentAvatar={isEditing ? tempAvatarUri : user?.avatarUri}
            onUpload={(uri) => setTempAvatarUri(uri)}
            role="instructor"
            size="lg"
            editable={isEditing}
          />
          {isEditing ? (
            <div className="space-y-4 w-full md:w-auto">
              <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-2xl font-extrabold">{user?.instructorProfile?.displayName}</p>
              <p className="text-base text-[var(--fn-text-muted)]">{user?.email}</p>
            </div>
          )}
        </div>

        <div className="space-y-6 mb-8">
          {/* Available Now Button */}
          {!isEditing && (
            <button
              type="button"
              onClick={() =>
                updateProfile({ instructorProfile: { availableNow: !profile?.availableNow } })
              }
              className={`w-full rounded-xl border p-5 text-left transition hover:opacity-90 ${
                profile?.availableNow ? 'border-[var(--fn-success)] bg-[var(--fn-success-muted)]' : 'border-[var(--fn-border)]'
              }`}>
              <span className="flex items-center gap-2 font-semibold text-lg">
                {profile?.availableNow ? (
                  <CircleCheck size={20} className="text-[var(--fn-success)]" />
                ) : (
                  <Circle size={20} className="text-[var(--fn-text-muted)]" />
                )}
                {profile?.availableNow ? 'Disponible ahora' : 'No disponible'}
              </span>
            </button>
          )}

          {!isEditing && (
            <div className="rounded-2xl border border-[var(--fn-border)] overflow-hidden">
              <ProfileMenuItem href="/instructor/profile/availability" label={PROFILE_MENU_LABELS.scheduleAvailability} />

              {/* Favorite Sports */}
              {editingFavoriteSports ? (
                <div className="p-6 border-b border-[var(--fn-border)]">
                  <MultiSelect
                    label={PROFILE_MENU_LABELS.favoriteSports}
                    value={favoriteSports}
                    onChange={setFavoriteSports}
                    options={DISCIPLINES.map((d) => ({
                      value: d,
                      label: DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS],
                    }))}
                  />
                  <div className="flex gap-3">
                    <Button title={GENERAL_LABELS.cancel} variant="outline" onClick={handleCancelFavoriteSports} />
                    <Button title={BUTTON_LABELS.save} onClick={handleSaveFavoriteSports} />
                  </div>
                </div>
              ) : (
                <div className="p-6 border-b border-[var(--fn-border)] flex justify-between items-center">
                  <div>
                    <p className="font-medium">{PROFILE_MENU_LABELS.favoriteSports}</p>
                    <p className="text-sm text-[var(--fn-text-muted)]">
                      {user?.favoriteSports.length ? user.favoriteSports.join(', ') : GENERAL_LABELS.none}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingFavoriteSports(true)}
                    className="font-semibold text-[var(--fn-primary)] transition hover:opacity-80"
                  >
                    {BUTTON_LABELS.edit}
                  </button>
                </div>
              )}
              
              {/* Certifications */}
              {editingCertifications ? (
                <div className="p-6 border-b border-[var(--fn-border)] space-y-4">
                  <p className="font-medium mb-2">{PROFILE_MENU_LABELS.certifications}</p>
                  
                  {/* Add new */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input 
                      label="Nombre de certificación" 
                      value={newCertName} 
                      onChange={(e) => setNewCertName(e.target.value)} 
                    />
                    <Input 
                      label="Emisor" 
                      value={newCertIssuer} 
                      onChange={(e) => setNewCertIssuer(e.target.value)} 
                    />
                    <Input 
                      label="Año" 
                      type="number" 
                      value={newCertYear} 
                      onChange={(e) => setNewCertYear(e.target.value)} 
                    />
                  </div>
                  <Button title="Agregar certificación" variant="outline" onClick={handleAddCertification} />
                  
                  {/* List */}
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-[var(--fn-surface-muted)] rounded-xl">
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-[var(--fn-text-muted)]">{cert.issuer} · {cert.year}</p>
                      </div>
                      <Button 
                        title="Eliminar" 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleRemoveCertification(idx)} 
                      />
                    </div>
                  ))}
                  
                  <div className="flex gap-3">
                    <Button title={GENERAL_LABELS.cancel} variant="outline" onClick={handleCancelCertifications} />
                    <Button title={BUTTON_LABELS.save} onClick={handleSaveCertifications} />
                  </div>
                </div>
              ) : (
                <div className="p-6 border-b border-[var(--fn-border)] flex justify-between items-center">
                  <div>
                    <p className="font-medium">{PROFILE_MENU_LABELS.certifications}</p>
                    {certifications.length === 0 ? (
                      <p className="text-sm text-[var(--fn-text-muted)]">No hay certificaciones agregadas.</p>
                    ) : (
                      <ul className="space-y-2 mt-2">
                        {certifications.map((cert, idx) => (
                          <li key={idx} className="text-sm">
                            <span className="font-medium">{cert.name}</span> · {cert.issuer} · {cert.year}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingCertifications(true)}
                    className="font-semibold text-[var(--fn-primary)] transition hover:opacity-80"
                  >
                    {BUTTON_LABELS.edit}
                  </button>
                </div>
              )}
              
              <ProfileMenuItem href="/instructor/profile/plan" label={PROFILE_MENU_LABELS.planCommission} />
              
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
