import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { User, Shield, Clock, Smartphone, Globe, Activity, FileText, Upload, Download, Plus, Trash2, Bell, Lock, Calendar, Key } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { authApi, uploadApi, scheduledNotificationApi, notificationApi } from '../lib/api';
import { toast } from 'sonner';

const AccountView = ({ user }) => {
  const { isDark } = useTheme();
  
  // State for extended profile
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    height: user.profile?.height || '',
    weight: user.profile?.weight || '',
    bloodType: user.profile?.bloodType || '',
    healthGoals: user.profile?.healthGoals || [],
    phoneNumber: user.phoneNumber || '',
    emailNotifications: user.emailNotifications ?? true,
    smsNotifications: user.smsNotifications ?? false,
    pushNotifications: user.pushNotifications ?? true
  });
  const [newGoal, setNewGoal] = useState('');

  // State for reports
  const [reports, setReports] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // State for scheduled notifications
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({ 
    label: '', 
    time: '', 
    channels: { email: true, sms: false },
    reminderEmail: '' 
  });

  // State for password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadReports();
    loadSchedules();
  }, []);

  const loadReports = async () => {
    try {
      const data = await uploadApi.getReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      const data = await scheduledNotificationApi.getAll();
      setSchedules(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      const channels = [];
      if (newSchedule.channels.email) channels.push('email');
      if (newSchedule.channels.sms) channels.push('sms');

      const payload = {
        label: newSchedule.label,
        time: newSchedule.time,
        channels
      };

      if (newSchedule.channels.email && newSchedule.reminderEmail) {
        payload.reminderEmail = newSchedule.reminderEmail;
      }

      await scheduledNotificationApi.create(payload);
      toast.success('Reminder scheduled! You will receive an email notification at the scheduled time.');
      setNewSchedule({ label: '', time: '', channels: { email: true, sms: false }, reminderEmail: '' });
      loadSchedules();
    } catch (error) {
      toast.error('Failed to add schedule');
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await scheduledNotificationApi.delete(id);
      toast.success('Schedule deleted');
      loadSchedules();
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };

  const handleToggleSchedule = async (id) => {
    try {
      await scheduledNotificationApi.toggle(id);
      loadSchedules();
    } catch (error) {
      toast.error('Failed to update schedule');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Previously';
    return format(new Date(dateString), 'PPP p');
  };

  // Profile Handlers
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await authApi.updateProfile({
        profile: {
          height: formData.height,
          weight: formData.weight,
          bloodType: formData.bloodType,
          healthGoals: formData.healthGoals
        },
        phoneNumber: formData.phoneNumber,
        emailNotifications: formData.emailNotifications,
        smsNotifications: formData.smsNotifications,
        pushNotifications: formData.pushNotifications
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully');
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setFormData(prev => ({
        ...prev,
        healthGoals: [...prev.healthGoals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const removeGoal = (index) => {
    setFormData(prev => ({
      ...prev,
      healthGoals: prev.healthGoals.filter((_, i) => i !== index)
    }));
  };

  // File Handlers
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadApi.uploadReport(file);
      toast.success('File uploaded successfully');
      loadReports();
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      toast.info('Generating PDF...');
      await uploadApi.downloadHistoryPDF();
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex justify-end gap-2">
        <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Health History
        </Button>
      </div>

      {/* Profile Section */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <User className="h-5 w-5 text-blue-500" />
            Profile Details
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={e => setFormData({...formData, height: e.target.value})}
                  className={`w-full p-2 rounded-md border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                  className={`w-full p-2 rounded-md border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Blood Type</label>
                <select
                  value={formData.bloodType}
                  onChange={e => setFormData({...formData, bloodType: e.target.value})}
                  className={`w-full p-2 rounded-md border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-300'}`}
                >
                  <option value="">Select...</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber || ''}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Notification Preferences</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications}
                    onChange={e => setFormData({...formData, emailNotifications: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Email Notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.smsNotifications}
                    onChange={e => setFormData({...formData, smsNotifications: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>SMS Alerts</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.pushNotifications}
                    onChange={e => setFormData({...formData, pushNotifications: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>In-App Alerts</span>
                </label>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Health Goals</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  placeholder="Add a goal (e.g., Drink more water)"
                  className={`flex-1 p-2 rounded-md border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-300'}`}
                />
                <Button type="button" onClick={addGoal} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <ul className="space-y-1">
                {formData.healthGoals.map((goal, idx) => (
                  <li key={idx} className={`flex justify-between items-center p-2 rounded-md ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{goal}</span>
                    <button type="button" onClick={() => removeGoal(idx)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className={`text-xs uppercase tracking-wider font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Full Name</p>
              <p className={`text-lg font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{user.fullName}</p>
            </div>
            
            <div className="space-y-1">
              <p className={`text-xs uppercase tracking-wider font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Email Address</p>
              <p className={`text-lg font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{user.email}</p>
            </div>

            <div className="space-y-1">
              <p className={`text-xs uppercase tracking-wider font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Height</p>
              <p className={`text-lg font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{user.profile?.height ? `${user.profile.height} cm` : 'Not set'}</p>
            </div>

            <div className="space-y-1">
              <p className={`text-xs uppercase tracking-wider font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Weight</p>
              <p className={`text-lg font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{user.profile?.weight ? `${user.profile.weight} kg` : 'Not set'}</p>
            </div>

            <div className="space-y-1">
              <p className={`text-xs uppercase tracking-wider font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Blood Type</p>
              <p className={`text-lg font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{user.profile?.bloodType || 'Not set'}</p>
            </div>
            
            <div className="col-span-full space-y-1">
              <p className={`text-xs uppercase tracking-wider font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Health Goals</p>
              {user.profile?.healthGoals && user.profile.healthGoals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.profile.healthGoals.map((goal, i) => (
                    <span key={i} className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                      {goal}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={`text-lg font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>No goals set yet</p>
              )}
            </div>

            <div className="col-span-full pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className={`text-xs uppercase tracking-wider font-medium mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Notification Settings</p>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${user.emailNotifications ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email</span>
                  <Button 
                    variant="ghost" 
                    size="xs" 
                    className="h-6 px-2 text-[10px] uppercase font-bold text-blue-500 hover:text-blue-600"
                    onClick={async () => {
                      try {
                        toast.promise(notificationApi.sendTestEmail(), {
                          loading: 'Sending test email...',
                          success: 'Test email sent! Check your inbox.',
                          error: 'Failed to send. Check your .env file.'
                        });
                      } catch (error) {}
                    }}
                  >
                    Send Test
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${user.smsNotifications ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>SMS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${user.pushNotifications ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>In-App</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scheduled Notifications Section */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Bell className="h-5 w-5 text-orange-500" />
          Scheduled Reminders
        </h2>

        <div className="space-y-6">
          <form onSubmit={handleAddSchedule} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Add New Reminder</h3>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 w-full">
                  <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Label</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Take Vitamins"
                    value={newSchedule.label}
                    onChange={e => setNewSchedule({...newSchedule, label: e.target.value})}
                    className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                  />
                </div>
                <div className="w-full md:w-32">
                  <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Time</label>
                  <input 
                    type="time" 
                    required
                    value={newSchedule.time}
                    onChange={e => setNewSchedule({...newSchedule, time: e.target.value})}
                    className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                  />
                </div>
              </div>

              {newSchedule.channels.email && (
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Email for Reminder <span className="text-slate-500">(optional - defaults to your account email)</span>
                  </label>
                  <input 
                    type="email" 
                    placeholder={user.email || "your-email@example.com"}
                    value={newSchedule.reminderEmail}
                    onChange={e => setNewSchedule({...newSchedule, reminderEmail: e.target.value})}
                    className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-600' : 'bg-white border-slate-300 placeholder-slate-400'}`}
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Leave empty to use your account email: {user.email}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={newSchedule.channels.email}
                      onChange={e => setNewSchedule({...newSchedule, channels: {...newSchedule.channels, email: e.target.checked}})} 
                      className="rounded border-gray-300"
                    />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>📧 Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={newSchedule.channels.sms}
                      onChange={e => setNewSchedule({...newSchedule, channels: {...newSchedule.channels, sms: e.target.checked}})}
                      className="rounded border-gray-300"
                    />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>📱 SMS</span>
                  </label>
                </div>
                <Button type="submit" disabled={!newSchedule.label || !newSchedule.time} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Reminder
                </Button>
              </div>
            </div>
          </form>

          <div className="space-y-2">
            {schedules.map(schedule => (
              <div key={schedule._id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${schedule.isActive ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600') : (isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{schedule.label}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      ⏰ {schedule.time} • {schedule.channels.map(c => c === 'email' ? '📧' : '📱').join(' ')} {schedule.channels.join(', ')}
                    </p>
                    {schedule.reminderEmail && schedule.channels.includes('email') && (
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        📧 {schedule.reminderEmail}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={schedule.isActive} onChange={() => handleToggleSchedule(schedule._id)} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteSchedule(schedule._id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {schedules.length === 0 && (
              <div className={`text-center py-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <p>No scheduled reminders yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Medical Reports Section */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <FileText className="h-5 w-5 text-purple-500" />
          Medical Reports
        </h2>

        <div className="mb-6">
          <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'}`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className={`w-8 h-8 mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>SVG, PNG, JPG or PDF (MAX. 5MB)</p>
            </div>
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" disabled={isUploading} />
          </label>
          {isUploading && <p className="text-center text-sm text-blue-500 mt-2">Uploading...</p>}
        </div>

        <div className="space-y-2">
          {reports.map((report) => (
            <div key={report._id} className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <FileText className={`h-8 w-8 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                <div>
                  <p className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{report.originalName}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{formatDate(report.uploadDate)} • {(report.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => uploadApi.downloadReport(report._id, report.originalName)}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {reports.length === 0 && (
            <p className={`text-center py-4 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No reports uploaded yet</p>
          )}
        </div>
      </div>

      {/* Login History Section */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Shield className="h-5 w-5 text-green-500" />
          Login Security
        </h2>

        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Account Created</p>
                <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Last Login</p>
                <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Sessions</p>
                <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user.loginHistory ? user.loginHistory.length : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className={`p-4 rounded-xl border mb-6 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-amber-500" />
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Password</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Last changed: {user.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {showPasswordChange ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {showPasswordChange && (
            <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
              <div>
                <label className={`text-xs font-medium block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${
                    isDark 
                      ? 'bg-slate-900 border-slate-700 text-white' 
                      : 'bg-white border-slate-300 text-slate-900'
                  } border focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none`}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className={`text-xs font-medium block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${
                    isDark 
                      ? 'bg-slate-900 border-slate-700 text-white' 
                      : 'bg-white border-slate-300 text-slate-900'
                  } border focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none`}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div>
                <label className={`text-xs font-medium block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${
                    isDark 
                      ? 'bg-slate-900 border-slate-700 text-white' 
                      : 'bg-white border-slate-300 text-slate-900'
                  } border focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none`}
                  placeholder="Confirm new password"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword
                    ? isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                Update Password
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Recent Activity</h3>
          
          <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <table className="w-full text-sm">
              <thead className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <tr>
                  <th className={`px-4 py-3 text-left font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Date & Time</th>
                  <th className={`px-4 py-3 text-left font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>IP Address</th>
                  <th className={`px-4 py-3 text-left font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Device</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {user.loginHistory && user.loginHistory.length > 0 ? (
                  user.loginHistory.slice().reverse().map((login, index) => (
                    <tr key={index} className={`${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                      <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 opacity-50" />
                          {formatDate(login.timestamp)}
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-3 w-3 opacity-50" />
                          {login.ipAddress || 'Unknown'}
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <div className="flex items-center gap-2" title={login.userAgent}>
                          <Smartphone className="h-3 w-3 opacity-50" />
                          <span className="truncate max-w-[200px] inline-block align-bottom">
                            {login.userAgent || 'Unknown'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className={`px-4 py-8 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      No login history available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountView;
