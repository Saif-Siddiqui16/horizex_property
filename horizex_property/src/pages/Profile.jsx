import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useGetProfileQuery, useUpdateProfileMutation } from '../store/api/authApi';
import { User, Mail, Lock, Phone, Save, CheckCircle, AlertCircle, Eye, EyeOff, MapPin, X } from 'lucide-react';

export const Profile = () => {
    const [__forceUpdate, __setForceUpdate] = useState(0);
    useEffect(() => {
        const handleUpdate = () => __setForceUpdate(p => p + 1);
        window.addEventListener('permissionsUpdated', handleUpdate);
        return () => window.removeEventListener('permissionsUpdated', handleUpdate);
    }, []);

    // RTK Query hooks
    const { data: profileApiData, isLoading: isProfileLoading, refetch: refetchProfile } = useGetProfileQuery();
    const [updateProfileMutation, { isLoading: isMutationSaving }] = useUpdateProfileMutation();

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: '',
        city: '',
        state: '',
        country: '',
        companyName: '',
        companyDetails: '',
        profilePictureUrl: null,
    });
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = React.useRef(null);

    // Sync RTK Query data when available
    useEffect(() => {
        if (profileApiData) {
            setProfile(prev => ({
                ...prev,
                ...profileApiData,
                firstName: profileApiData.firstName ?? prev.firstName,
                lastName: profileApiData.lastName ?? prev.lastName,
                name: profileApiData.name ?? prev.name,
                email: profileApiData.email ?? prev.email,
                phone: profileApiData.phone ?? prev.phone,
                role: profileApiData.role ?? prev.role,
                city: profileApiData.city ?? prev.city ?? '',
                state: profileApiData.state ?? prev.state ?? '',
                country: profileApiData.country ?? prev.country ?? '',
                companyName: profileApiData.companyName ?? prev.companyName ?? '',
                companyDetails: profileApiData.companyDetails ?? prev.companyDetails ?? '',
                profilePictureUrl: profileApiData.profilePictureUrl ?? prev.profilePictureUrl ?? null,
            }));
            setLoading(false);
        }
    }, [profileApiData]);

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            if (refetchProfile) {
                const res = await refetchProfile();
                if (res?.data) {
                    const data = res.data?.data || res.data;
                    setProfile(prev => ({ ...prev, ...data }));
                    setLoading(false);
                    return;
                }
            }

            // Fallback via axios client
            const res = await api.get('/auth/profile');
            const data = res.data?.data || res.data;
            if (data) {
                setProfile(prev => ({ ...prev, ...data }));
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            // Fallback from localStorage
            try {
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (storedUser && storedUser.email) {
                    const fullName = `${storedUser.firstName || ''} ${storedUser.lastName || ''}`.trim();
                    setProfile(prev => ({
                        ...prev,
                        ...storedUser,
                        name: storedUser.name || fullName || storedUser.email.split('@')[0],
                        city: storedUser.city || '',
                        state: storedUser.state || '',
                        country: storedUser.country || '',
                        companyName: storedUser.company?.name || storedUser.companyName || '',
                        companyDetails: storedUser.companyDetails || '',
                    }));
                } else {
                    setMessage({ type: 'error', text: 'Failed to load profile details.' });
                }
            } catch (e) {
                setMessage({ type: 'error', text: 'Failed to load profile details.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords if changing
        if (passwordData.newPassword) {
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                setMessage({ type: 'error', text: 'Passwords do not match.' });
                return;
            }
            if (passwordData.newPassword.length < 6) {
                setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
                return;
            }
        }

        try {
            setSaving(true);
            setMessage({ type: '', text: '' });

            const payload = {
                name: profile.name,
                email: profile.email,
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                phone: profile.phone || '',
                city: profile.city || '',
                state: profile.state || '',
                country: profile.country || '',
                companyName: profile.companyName || '',
                companyDetails: profile.companyDetails || '',
                profilePictureUrl: imagePreview || profile.profilePictureUrl || null,
                ...(passwordData.newPassword ? { password: passwordData.newPassword } : {})
            };

            let updatedUser = null;
            try {
                const res = await updateProfileMutation(payload).unwrap();
                updatedUser = res?.user || res?.data?.user || res?.data || res;
            } catch (rtkErr) {
                console.warn('RTK updateProfile fallback to axios:', rtkErr);
                const res = await api.patch('/auth/profile', payload);
                updatedUser = res.data?.data?.user || res.data?.user || res.data;
            }

            // Update local storage user info
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const mergedUser = { ...storedUser, ...(updatedUser || payload) };
            localStorage.setItem('user', JSON.stringify(mergedUser));

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setPasswordData({ newPassword: '', confirmPassword: '' });

            // Refresh local profile
            if (updatedUser) {
                setProfile(prev => ({ ...prev, ...updatedUser }));
            }
            if (refetchProfile) {
                refetchProfile();
            }
        } catch (err) {
            console.error('Update Error:', err);
            setMessage({
                type: 'error',
                text: err.response?.data?.message || err.data?.message || err.message || 'Failed to update profile.'
            });
        } finally {
            setSaving(false);
        }
    };

    const isCompanyEditable = ['ADMIN', 'SUPER_ADMIN'].includes(profile.role);
    const isSaveInProgress = saving || isMutationSaving;

    if (loading && !profile.email) {
        return (
            <>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">

                {/* Floating Notification */}
                {message.text && (
                    <div className="fixed top-24 right-8 z-[100] anim-slide-up">
                        <div className={`p-4 pr-12 rounded-2xl flex items-center gap-3 border shadow-[0_20px_40px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all ${message.type === 'success'
                            ? 'bg-emerald-50/90 text-emerald-800 border-emerald-100'
                            : 'bg-red-50/90 text-red-800 border-red-100'
                            }`}>
                            {message.type === 'success' ? (
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                                    <CheckCircle size={22} />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-sm">
                                    <AlertCircle size={22} />
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-black tracking-tight">{message.type === 'success' ? 'Success!' : 'Error'}</p>
                                <p className="text-[13px] font-medium opacity-90">{message.text}</p>
                            </div>

                            <button
                                onClick={() => setMessage({ type: '', text: '' })}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Avatar Section */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-[22px] shadow-sm border border-slate-200 flex flex-col items-center">
                            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-tr from-primary-600 to-indigo-400 flex items-center justify-center text-white text-4xl font-black shadow-2xl border-4 border-white">
                                    {imagePreview || profile.profilePictureUrl ? (
                                        <img src={imagePreview || profile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        profile.firstName?.[0] || profile.name?.[0] || 'A'
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">
                                    Change Photo
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            <h3 className="mt-5 text-xl font-black text-slate-800 tracking-tight">{profile.name}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{profile.role}</p>

                            <div className="w-full h-px bg-slate-100 my-6" />

                            <div className="w-full space-y-4">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail size={16} className="text-slate-400" />
                                    <span className="text-sm font-medium truncate">{profile.email}</span>
                                </div>
                                {profile.phone && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Phone size={16} className="text-slate-400" />
                                        <span className="text-sm font-medium">{profile.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="md:col-span-2 space-y-6">

                        {/* General Info */}
                        <div className="bg-white p-8 rounded-[22px] shadow-sm border border-slate-200 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                                    <User size={18} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 tracking-tight">Account Information</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-500 ml-1">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={profile.firstName || ''}
                                        onChange={handleProfileChange}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-slate-900"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-500 ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={profile.lastName || ''}
                                        onChange={handleProfileChange}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-slate-900"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-slate-500 ml-1">Display Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name || ''}
                                    onChange={handleProfileChange}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-slate-900"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-500 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email || ''}
                                        onChange={handleProfileChange}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-slate-900"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-500 ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <div className="absolute left-0 top-0 h-11 w-12 flex items-center justify-center text-slate-400 font-bold border-r border-slate-100 bg-slate-50/50 rounded-l-xl pointer-events-none">
                                            +1
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profile.phone?.replace(/^\+1/, '') || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setProfile(prev => ({ ...prev, phone: '+1' + val }));
                                            }}
                                            className="w-full h-11 pl-14 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-slate-900"
                                            placeholder="5550000000"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-8 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <MapPin size={18} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 tracking-tight">Location Details</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-500 ml-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={profile.city || ''}
                                        onChange={handleProfileChange}
                                        disabled={!isCompanyEditable}
                                        className={`w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-slate-900 ${!isCompanyEditable ? 'bg-slate-50 cursor-not-allowed opacity-75' : ''}`}
                                        placeholder="Toronto"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-500 ml-1">State / Province</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={profile.state || ''}
                                        onChange={handleProfileChange}
                                        disabled={!isCompanyEditable}
                                        className={`w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-slate-900 ${!isCompanyEditable ? 'bg-slate-50 cursor-not-allowed opacity-75' : ''}`}
                                        placeholder="Ontario"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-500 ml-1">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={profile.country || ''}
                                        onChange={handleProfileChange}
                                        disabled={!isCompanyEditable}
                                        className={`w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-slate-900 ${!isCompanyEditable ? 'bg-slate-50 cursor-not-allowed opacity-75' : ''}`}
                                        placeholder="Canada"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-8 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <div className="font-black text-xs italic">C</div>
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 tracking-tight">Company Information</h4>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-500 ml-1">Company Name</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={profile.companyName || ''}
                                        onChange={handleProfileChange}
                                        disabled={!isCompanyEditable}
                                        className={`w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-slate-900 ${!isCompanyEditable ? 'bg-slate-50 cursor-not-allowed opacity-75' : ''}`}
                                        placeholder="e.g. Horizex Properties"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-500 ml-1">Company Details</label>
                                    <textarea
                                        name="companyDetails"
                                        value={profile.companyDetails || ''}
                                        onChange={handleProfileChange}
                                        disabled={!isCompanyEditable}
                                        rows={3}
                                        className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-slate-900 min-h-[100px] ${!isCompanyEditable ? 'bg-slate-50 cursor-not-allowed opacity-75' : ''}`}
                                        placeholder="Mention your company address, registration number, tax details, or mission statement..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Change */}
                        <div className="bg-white p-8 rounded-[22px] shadow-sm border border-slate-200 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <Lock size={18} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 tracking-tight">Security</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-500 ml-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full h-11 px-4 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-slate-900"
                                            placeholder="Leave blank to keep current"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-500 ml-1">Confirm New Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-slate-900"
                                        placeholder="Repeat new password"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 font-medium italic">We recommend a strong, unique password to stay protected.</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isSaveInProgress}
                                className="h-12 px-8 bg-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {isSaveInProgress ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save size={18} />
                                )}
                                {isSaveInProgress ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </>
    );
};
