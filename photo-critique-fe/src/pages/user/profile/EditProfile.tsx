import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userService, type UserProfileResponse } from "../../../services";
import { Button, Loading, ToastType } from "../../../components";
import { showToast } from "../../../utils";
import { Input } from "../../../components/common/Input";
import { FileUpload } from "../../../components/FileUpload/FileUpload";
import type { FileUploadItemData } from "../../../components/FileUpload/FileUploadItem";

type TabType = "account" | "privacy" | "notifications" | "connected";

export const EditProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("account");
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [privacySetting, setPrivacySetting] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [profilePicture, setProfilePicture] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadItemData[]>([]);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profileData = await userService.getProfile();
      setProfile(profileData);
      setFullName(profileData.fullName || "");
      setBio(profileData.bio || "");
      setPrivacySetting((profileData.privacySetting as "PUBLIC" | "PRIVATE") || "PUBLIC");
      setProfilePicture(profileData.profilePicture || "");
    } catch (error: any) {
      showToast(ToastType.ERROR, error?.message || "Failed to load profile");
      navigate("/profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await userService.updateProfile({
        fullName,
        bio,
        profilePicture,
        privacySetting,
      });
      showToast(ToastType.SUCCESS, "Profile updated successfully");
      navigate(`/profile`);
    } catch (error: any) {
      showToast(ToastType.ERROR, error?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    // TODO: Implement delete account
    showToast(ToastType.INFO, "Delete account functionality coming soon");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading variant="fullscreen" text="Loading profile..." />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const tabs = [
    { id: "account" as TabType, label: "Account" },
    { id: "privacy" as TabType, label: "Privacy & Security" },
    { id: "notifications" as TabType, label: "Notifications" },
    { id: "connected" as TabType, label: "Connected Accounts" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "text-[#15B8A6] border-b-2 border-[#15B8A6]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "account" && (
        <div className="space-y-8">
          {/* Profile Photo */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h2>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <img
                  src={profilePicture || profile.profilePicture || "/default-avatar.png"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Update your photo</h3>
                <p className="text-sm text-gray-500 mb-4">
                  This will be displayed on your profile.
                </p>
                <div>
                  <FileUpload
                    files={uploadedFiles}
                    onFilesChange={(files) => {
                      setUploadedFiles(files);
                      if (files.length > 0 && files[0].imageInfo) {
                        setProfilePicture(files[0].imageInfo.url);
                      } else if (files.length === 0) {
                        setProfilePicture(profile.profilePicture || "");
                      }
                    }}
                    maxFiles={1}
                    acceptedTypes="image/*"
                    variant="compact"
                  />
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <Input
                  value={profile.username}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  value={email || ""}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  type="email"
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15B8A6] focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Danger Zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Delete Account</h3>
                <p className="text-sm text-gray-500">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>
              <Button variant="danger" onClick={handleDeleteAccount}>
                Delete My Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "privacy" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Privacy & Security</h2>
          
          {/* Privacy Setting */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Account Privacy
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  value="PUBLIC"
                  checked={privacySetting === "PUBLIC"}
                  onChange={() => setPrivacySetting("PUBLIC")}
                  className="w-4 h-4 text-[#15B8A6] focus:ring-[#15B8A6]"
                />
                <div>
                  <span className="font-medium text-gray-900">Public</span>
                  <p className="text-sm text-gray-500">
                    Anyone can view your profile and posts
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  value="PRIVATE"
                  checked={privacySetting === "PRIVATE"}
                  onChange={() => setPrivacySetting("PRIVATE")}
                  className="w-4 h-4 text-[#15B8A6] focus:ring-[#15B8A6]"
                />
                <div>
                  <span className="font-medium text-gray-900">Private</span>
                  <p className="text-sm text-gray-500">
                    Only approved followers can view your profile and posts
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Notifications</h2>
          <p className="text-gray-500">Notification settings coming soon...</p>
        </div>
      )}

      {activeTab === "connected" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Connected Accounts</h2>
          <p className="text-gray-500">Connected accounts settings coming soon...</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={isSaving}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

