'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Edit, Lock, Download, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import MySideBar from './ui/sideBare';
import { getApiUrl } from '../utils/config';

interface UserData {
  name: string;
  surname: string;
  email: string;
  phonenumber: string;
  university: string;
  faculty: string;
  speciality: string;
}

interface IUser {
  user: UserData & {
    id_etudiant: string;
  };
}

const Profile = () => {

interface IUser {
  user: {
    id_etudiant: string;
    name: string;
    surname: string;
    email: string;
    phonenumber: string;
    university: string;
    faculty: string;
    speciality: string;
  };
}

const [user, setUser] = useState<IUser | null>(null);
  const [memoires, setMemoires] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: '',
    surname: '',
    email: '',
    phonenumber: '',
    university: '',
    faculty: '',
    speciality: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditedUser({
        name: parsedUser.user.name || '',
        surname: parsedUser.user.surname || '',
        email: parsedUser.user.email || '',
        phonenumber: parsedUser.user.phonenumber || '',
        university: parsedUser.user.university || '',
        faculty: parsedUser.user.faculty || '',
        speciality: parsedUser.user.speciality || '',
      });
      fetchMemoires(parsedUser.user.id_etudiant);
      fetchNotifications(parsedUser.user.id_etudiant);
    }
  }, []);

  const fetchMemoires = async (userId) => {
    try {
      const response = await fetch(getApiUrl(`/api/memoire/etudiant/${userId}`));
      if (!response.ok) throw new Error('Failed to fetch theses');
      const data = await response.json();
      setMemoires(data);
    } catch (error) {
      console.error('Error fetching theses:', error);
      toast.error('Failed to load theses');
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const response = await fetch(getApiUrl(`/api/notifications/${userId}`));
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(getApiUrl(`/api/users/${user.user.id_etudiant}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedUser),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedUser = { ...user, user: { ...user.user, ...editedUser }};
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/users/${user.user.id_etudiant}/password`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) throw new Error('Failed to update password');
      
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Sidebar */}
      {/* <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-600">📚 BANK-MEMO</h1>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {[
              { name: "Dashboard", path: "./login", icon: <BookOpen className="mr-3" /> },
              { name: "Profile", path: "./profile", icon: <User className="mr-3" /> }
            ].map((item, index) => (
              <a
                key={index}
                href={item.path}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
              >
                {item.icon}
                {item.name}
              </a>
            ))}
          </nav>

          <div className="p-4">
            <a href="/" className="flex items-center text-gray-600 hover:text-blue-600">
              <ArrowLeft className="mr-2" size={20} />
              Back to Home
            </a>
          </div>
        </div>
      </div> */}
      <MySideBar />
      
      {/* Main Content - Updated for responsiveness */}
      <div className="lg:ml-64 p-4 md:p-8">
        {/* Profile Header - Made responsive */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                {user?.user?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-center md:text-left md:ml-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.name}
                      onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                      className="border rounded px-2 py-1 w-full md:w-auto"
                    />
                  ) : (
                    user?.user?.name
                  )}
                </h2>
                <p className="text-gray-600 mt-1">Student</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center justify-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 w-full md:w-auto"
              >
                <Lock className="mr-2" size={18} />
                Change Password
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center justify-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 w-full md:w-auto"
              >
                <Edit className="mr-2" size={18} />
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>
          </div>
      
          {/* Personal Information - Made responsive */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.name}
                      onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{user?.user?.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{user?.user?.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedUser.phonenumber}
                      onChange={(e) => setEditedUser({ ...editedUser, phonenumber: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{user?.user?.phonenumber || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600">University</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.university}
                      onChange={(e) => setEditedUser({ ...editedUser, university: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{user?.user?.university || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Faculty</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.faculty}
                      onChange={(e) => setEditedUser({ ...editedUser, faculty: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{user?.user?.faculty || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Speciality</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.speciality}
                      onChange={(e) => setEditedUser({ ...editedUser, speciality: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{user?.user?.speciality || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thesis History - Improved responsive design */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-8 mb-8">
          <h3 className="text-xl font-semibold mb-6">Thesis History</h3>
          
          {/* Mobile view */}
          <div className="md:hidden space-y-4">
            {memoires.map((memoire) => (
              <div key={memoire.id_memoire} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-900">{memoire.libelle}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      memoire.status === 'validated' ? 'bg-green-100 text-green-800' :
                      memoire.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {memoire.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Submitted:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(memoire.date_soumission).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-end mt-3">
                    <a
                      href={getApiUrl(`/${memoire.file_path}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-900"
                    >
                      <Download size={18} className="mr-1" />
                      <span className="text-sm">Download</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {memoires.map((memoire) => (
                  <tr key={memoire.id_memoire} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{memoire.libelle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        memoire.status === 'validated' ? 'bg-green-100 text-green-800' :
                        memoire.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {memoire.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(memoire.date_soumission).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={getApiUrl(`/${memoire.file_path}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-900"
                      >
                        <Download size={18} className="mr-1" />
                        <span className="text-sm">Download</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications - Made responsive */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-8">
          <h3 className="text-xl font-semibold mb-6">Notifications</h3>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id_notification} className="flex items-start p-3 md:p-4 bg-gray-50 rounded-lg">
                <Bell className="text-blue-500 mt-1 mr-3 md:mr-4 flex-shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="text-sm md:text-base text-gray-900 break-words">{notification.message}</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    {new Date(notification.date_creation).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-8 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-6">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;