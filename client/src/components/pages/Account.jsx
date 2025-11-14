// client/src/components/pages/Account.jsx (Complete with real API integration)
import React, { useState, useEffect } from 'react';
import { 
  User, 
  LogOut, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  Edit, 
  Save, 
  X, 
  AlertTriangle,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Tractor,
  Wheat
} from 'lucide-react';
import { authAPI } from '../../services/api';

const Account = ({ onLogout }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.getProfile();
      if (response.data.success) {
        setUserProfile(response.data.data);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
      
      // Fallback to token data if API fails
      const token = localStorage.getItem('farmer-token');
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          setUserProfile({
            name: tokenData.name || 'Farmer',
            email: tokenData.email || '',
            phoneNumber: tokenData.phoneNumber || '',
            location: tokenData.location || {},
            profile: tokenData.profile || {},
            createdAt: tokenData.iat ? new Date(tokenData.iat * 1000) : new Date(),
            totalFields: 0,
            totalArea: 0
          });
        } catch (tokenError) {
          console.error('Error parsing token:', tokenError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditForm({
      name: userProfile?.name || '',
      phoneNumber: userProfile?.phoneNumber || '',
      village: userProfile?.location?.village || '',
      district: userProfile?.location?.district || '',
      state: userProfile?.location?.state || '',
      farmingExperience: userProfile?.profile?.farmingExperience || '',
      primaryCrops: userProfile?.profile?.primaryCrops?.join(', ') || ''
    });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const updateData = {
        name: editForm.name,
        phoneNumber: editForm.phoneNumber,
        location: {
          village: editForm.village,
          district: editForm.district,
          state: editForm.state
        },
        profile: {
          farmingExperience: editForm.farmingExperience,
          primaryCrops: editForm.primaryCrops.split(',').map(crop => crop.trim()).filter(crop => crop)
        }
      };

      const response = await authAPI.updateProfile(updateData);
      if (response.data.success) {
        setUserProfile(response.data.user);
        setEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({});
    setError(null);
  };

  const accountItems = [
    { 
      icon: Settings, 
      label: 'Farm Settings', 
      description: 'Configure your farm preferences and defaults',
      action: () => console.log('Farm settings clicked')
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      description: 'Manage alerts and notification preferences',
      action: () => console.log('Notifications clicked')
    },
    { 
      icon: Shield, 
      label: 'Privacy & Security', 
      description: 'Password and security settings',
      action: () => console.log('Security clicked')
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      description: 'Get help and contact our support team',
      action: () => console.log('Help clicked')
    },
  ];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="text-green-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50/20 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle size={20} className="text-red-500" />
            <div className="flex-1">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-600 text-white p-3 rounded-lg">
              <User size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {userProfile?.name || 'Farmer'}
              </h1>
              <p className="text-gray-600">
                Farmer • Member since {userProfile?.createdAt ? new Date(userProfile.createdAt).getFullYear() : 2024}
              </p>
            </div>
          </div>
          
          {!editing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700:text-blue-300 transition-colors"
            >
              <Edit size={16} />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-700:text-gray-300 px-3 py-2 border border-gray-300 rounded-lg transition-colors"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Information */}
        {editing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Village
                </label>
                <input
                  type="text"
                  value={editForm.village}
                  onChange={(e) => setEditForm(prev => ({ ...prev, village: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter village name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <input
                  type="text"
                  value={editForm.district}
                  onChange={(e) => setEditForm(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter district name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={editForm.state}
                  onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter state name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farming Experience
                </label>
                <select
                  value={editForm.farmingExperience}
                  onChange={(e) => setEditForm(prev => ({ ...prev, farmingExperience: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select experience level</option>
                  <option value="0-2 years">0-2 years (Beginner)</option>
                  <option value="3-5 years">3-5 years (Intermediate)</option>
                  <option value="6-10 years">6-10 years (Experienced)</option>
                  <option value="10+ years">10+ years (Expert)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Crops (comma separated)
              </label>
              <input
                type="text"
                value={editForm.primaryCrops}
                onChange={(e) => setEditForm(prev => ({ ...prev, primaryCrops: e.target.value }))}
                placeholder="e.g., Wheat, Rice, Corn, Soybeans"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple crops with commas
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Phone size={18} className="mr-2 text-gray-500" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">
                      {userProfile?.email || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">
                      {userProfile?.phoneNumber || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin size={18} className="mr-2 text-gray-500" />
                Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Village</p>
                  <p className="font-medium text-gray-900">
                    {userProfile?.location?.village || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">District</p>
                  <p className="font-medium text-gray-900">
                    {userProfile?.location?.district || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">State</p>
                  <p className="font-medium text-gray-900">
                    {userProfile?.location?.state || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Farm Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Tractor size={18} className="mr-2 text-gray-500" />
                Farming Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium text-gray-900">
                      {userProfile?.profile?.farmingExperience || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Wheat size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Primary Crops</p>
                    <p className="font-medium text-gray-900">
                      {userProfile?.profile?.primaryCrops?.length > 0 
                        ? userProfile.profile.primaryCrops.join(', ')
                        : 'Not provided'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Farm Statistics */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Farm Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50/20 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="bg-green-600 text-white p-2 rounded-lg">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-medium text-green-900">Total Farm Area</h4>
                  <p className="text-2xl font-bold text-green-700">
                    {userProfile?.totalArea || 0} hectares
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50/20 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <Tractor size={18} />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Active Fields</h4>
                  <p className="text-2xl font-bold text-blue-700">
                    {userProfile?.totalFields || 0} fields
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
        
        <div className="space-y-2">
          {accountItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50:bg-gray-700 rounded-lg transition-colors"
              >
                <Icon size={20} className="text-gray-400" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.label}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50:bg-red-900/20 rounded-lg transition-colors border border-red-200"
        >
          <LogOut size={20} className="text-red-500" />
          <div className="flex-1">
            <h3 className="font-medium text-red-700">Sign Out</h3>
            <p className="text-sm text-red-500">Sign out of your account</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Account;