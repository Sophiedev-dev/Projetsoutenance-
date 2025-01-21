'use client';

import React, { useState } from 'react';
import { ArrowLeft, Book, BookOpen, Library, User, Settings, Bell, Edit, Shield, Award } from 'lucide-react';

const Profile = () => {
  const [userStats] = useState({
    documentsAdded: 45,
    comments: 128,
    readingTime: "126h",
    followers: 89,
    following: 64
  });

  const [recentActivity] = useState([
    { type: 'comment', content: 'Commented on "Machine Learning Applications"', time: '2h ago' },
    { type: 'read', content: 'Read "Renewable Energy Systems"', time: '5h ago' },
    { type: 'upload', content: 'Uploaded "Data Science Fundamentals"', time: 'Yesterday' },
  ]);

  const [collections] = useState([
    { name: 'ML Research', count: 12 },
    { name: 'Academic Papers', count: 8 },
    { name: 'Study Materials', count: 15 },
  ]);

  const [badges] = useState([
    { name: 'Top Contributor', icon: '🏆' },
    { name: 'Frequent Reader', icon: '📚' },
    { name: 'Helpful Reviewer', icon: '⭐' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-600">📚 BANK-MEMO</h1>
          </div>


          <nav className="flex-1 px-4 space-y-2">
            {[
              { name: "Dashboard", path: "./login", icon: <BookOpen className="mr-3" /> },
              { name: "My Books", path: "./mybook", icon: <Book className="mr-3" /> },
              { name: "Collections", path: "/collections", icon: <Library className="mr-3" /> },
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
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                <img 
                  src="/api/placeholder/96/96" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-800">John Doe</h2>
                <p className="text-gray-600">Research Scholar | Data Science Enthusiast</p>
                <p className="mt-2 text-gray-500">
                  Passionate about machine learning and its applications in solving real-world problems.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="p-2 text-gray-600 hover:text-blue-600">
                <Bell size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600">
                <Settings size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600">
                <Edit size={20} />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {Object.entries(userStats).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-gray-500 text-sm capitalize">{key}</h3>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Collections */}
          <div className="col-span-2 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">My Collections</h3>
            <div className="grid grid-cols-2 gap-4">
              {collections.map((collection, index) => (
                <div key={index} className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer">
                  <h4 className="font-semibold">{collection.name}</h4>
                  <p className="text-gray-600">{collection.count} items</p>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Achievements</h3>
            <div className="space-y-4">
              {badges.map((badge, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-2xl mr-3">{badge.icon}</span>
                  <span className="font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-span-2 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-gray-800">{activity.content}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Settings Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Privacy</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="mr-2" size={20} />
                  <span>Profile Visibility</span>
                </div>
                <select className="border rounded-md px-2 py-1">
                  <option>Public</option>
                  <option>Private</option>
                  <option>Friends</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;