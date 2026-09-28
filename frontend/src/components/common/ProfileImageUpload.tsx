import React, { useRef, useState } from 'react';
import { Camera, RefreshCw, Trash2, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../api/client';
import type { User } from '../../types';

interface ProfileImageUploadProps {
    user?: User | null;
    size?: 'sm' | 'md' | 'lg';
    showControls?: boolean;
    label?: string;
    helperText?: string;
    onSuccess?: (updatedUser: User) => void;
    onImageUploaded?: (imageUrl: string) => void;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
    user: propUser,
    size = 'md',
    showControls = true,
    label,
    helperText,
    onSuccess,
    onImageUploaded,
}) => {
    const { user: authUser, uploadAvatar, removeAvatar } = useAuth();
    const { showToast } = useToast();
    const currentUser = propUser || authUser;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [error, setError] = useState('');

    const sizeClasses = {
        sm: 'h-12 w-12 text-base rounded-xl',
        md: 'h-20 w-20 text-2xl rounded-2xl sm:h-24 sm:w-24',
        lg: 'h-28 w-28 text-3xl rounded-3xl sm:h-32 sm:w-32',
    }[size];

    const iconSizeClasses = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    }[size];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file (PNG, JPEG, or WebP).');
            showToast('Please select a valid image file.', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Image file is too large (maximum limit is 10MB).');
            showToast('Image file exceeds the 10MB limit.', 'error');
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            const updated = await uploadAvatar(file);
            showToast('Profile photo uploaded and optimized successfully.', 'success');
            if (onSuccess) onSuccess(updated);
            if (onImageUploaded && updated.profile_image) onImageUploaded(updated.profile_image);
        } catch (err) {
            const msg = getApiErrorMessage(err, 'Failed to upload and process profile photo.');
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = async () => {
        if (!currentUser?.profile_image) return;
        setIsRemoving(true);
        setError('');
        try {
            const updated = await removeAvatar();
            showToast('Profile photo removed.', 'success');
            if (onSuccess) onSuccess(updated);
            if (onImageUploaded) onImageUploaded('');
        } catch (err) {
            const msg = getApiErrorMessage(err, 'Failed to remove profile photo.');
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setIsRemoving(false);
        }
    };

    const hasUploadedImage = Boolean(currentUser?.profile_image);
    const initialLetter = (currentUser?.first_name?.[0] || currentUser?.email?.[0] || 'U').toUpperCase();

    return (
        <div className="flex flex-col items-center sm:items-start gap-3">
            {label && (
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {label}
                </label>
            )}

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative group shrink-0">
                    {/* Avatar Display */}
                    <div
                        className={`relative overflow-hidden bg-gradient-to-br from-brand-500 to-indigo-600 text-white font-black flex items-center justify-center shadow-lg ring-4 ring-white/20 select-none ${sizeClasses}`}
                    >
                        {hasUploadedImage ? (
                            <img
                                src={currentUser?.profile_image}
                                alt={currentUser?.full_name || 'Profile Avatar'}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <span>{initialLetter}</span>
                        )}

                        {/* Upload Spinner Overlay */}
                        {(isUploading || isRemoving) && (
                            <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center text-white backdrop-blur-xs">
                                <RefreshCw className="h-6 w-6 animate-spin text-brand-400 mb-1" />
                                <span className="text-[9px] font-bold uppercase tracking-wider">
                                    {isUploading ? 'Optimizing' : 'Removing'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Upload Trigger Badge */}
                    {showControls && (
                        <button
                            type="button"
                            disabled={isUploading || isRemoving}
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-slate-900 text-white border-2 border-white shadow-md hover:bg-brand-600 active:scale-95 transition-all disabled:opacity-50"
                            title="Upload new profile photo"
                        >
                            <Camera className={iconSizeClasses} />
                        </button>
                    )}
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Action Buttons & Guidance */}
                {showControls && (
                    <div className="space-y-1.5 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <button
                                type="button"
                                disabled={isUploading || isRemoving}
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs active:scale-95 transition disabled:opacity-50"
                            >
                                <Upload className="h-3.5 w-3.5 text-brand-600" />
                                <span>{hasUploadedImage ? 'Change Photo' : 'Upload Photo'}</span>
                            </button>

                            {hasUploadedImage && (
                                <button
                                    type="button"
                                    disabled={isUploading || isRemoving}
                                    onClick={handleRemove}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-100 bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 shadow-xs active:scale-95 transition disabled:opacity-50"
                                    title="Remove current photo"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Remove</span>
                                </button>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                            {helperText || 'PNG, JPG, or WebP. Automatically cropped and optimized to 400×400 for fast loading.'}
                        </p>
                        {error && (
                            <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                <span>{error}</span>
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
