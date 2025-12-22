import React, { useState } from "react";
import { Button } from "../../components";
import { CameraIcon, PaperAirplaneIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import type { UserProfileResponse } from "../../services";
import { useNavigate } from "react-router-dom";
import { FollowersFollowingModal } from "./FollowersFollowingModal";

interface ProfileHeaderProps {
  profile: UserProfileResponse;
  isOwnProfile: boolean;
  postsCount: number;
  onFollow: () => void;
}

const ProfileHeaderSection: React.FC<{
  profile: UserProfileResponse;
  isOwnProfile: boolean;
  postsCount: number;
  onFollow: () => void;
}> = ({ profile, isOwnProfile, postsCount, onFollow }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-start gap-6 h-full">
      {/* Profile Picture */}
      <div className="relative flex-shrink-0">
        <img
          src={profile.profilePicture || "/default-avatar.png"}
          alt={profile.username}
          className="w-32 h-32 rounded-full object-cover p-1 border-2 border-gray-200"
        />
        {profile.isOnline && (
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* User Info Section */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
        {/* Name and Handle with Buttons */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold text-gray-700 truncate" title={profile.fullName}>{profile.fullName}</h1>
            <p className="text-md italic text-[#15B8A6] font-semibold truncate">@{profile.username}</p>
          </div>
          {!isOwnProfile ? (
            <div className="flex gap-3 flex-shrink-0">
              <Button
                variant={profile.isFollowing ? "secondary" : profile.followStatus === "PENDING" ? "secondary" : "primary"}
                className="w-full rounded-xl"
                onClick={onFollow}
                leftIcon={profile.isFollowing || profile.followStatus === "PENDING" ? undefined : ({ className }) => <PlusIcon className={`${className} text-white stroke-[3] p-0.5 rounded-full border-1 border-white`} />}
              >
                {profile.isFollowing ? "Following" : profile.followStatus === "PENDING" ? "Pending" : "Follow"}
              </Button>
              <Button
                variant="secondary"
                className="w-full rounded-xl"
                onClick={() => {}}
                leftIcon={PaperAirplaneIcon}
              >
                Message
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 flex-shrink-0">
              <Button
                variant="secondary"
                className="w-full rounded-xl"
                onClick={() => {navigate(`/profile/${profile.username}/edit`);}}
                leftIcon={PencilIcon}
              >
                Edit Profile
              </Button>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="text-sm text-gray-500 font-light leading-relaxed w-full line-clamp-2 overflow-hidden">
            {profile.bio}
          </div>
        )}

        <ProfileStats 
          postsCount={postsCount} 
          followersCount={profile.followersCount || 0} 
          followingCount={profile.followingCount || 0}
          userId={profile.id}
        />
      </div>
    </div>
  );
};

export const ProfileStats: React.FC<{
  postsCount?: number;
  followersCount: number;
  followingCount: number;
  size?: "small" | "medium" | "large";
  userId?: string;
}> = ({ postsCount, followersCount, followingCount, size = "large", userId }) => {
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const formatNumber = (num: number | undefined): string => {
    if (!num) return "0";
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const sizeClasses = {
    small: {
      container: "p-3 rounded-xl",
      grid: "gap-3",
      number: "text-lg",
      label: "text-xs",
      margin: "mt-0.5",
    },
    medium: {
      container: "p-4 rounded-2xl",
      grid: "gap-4",
      number: "text-xl",
      label: "text-xs",
      margin: "mt-1",
    },
    large: {
      container: "p-6 rounded-3xl",
      grid: "gap-6",
      number: "text-2xl",
      label: "text-sm",
      margin: "mt-1",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center justify-center bg-gray-50 ${classes.container}`}>
      <div className={`grid ${postsCount ? "grid-cols-3" : "grid-cols-2"} ${classes.grid} w-full`}>
        {/* Posts */}
        {postsCount && (
          <div className="text-left border-r border-gray-300"> 
            <div className={`${classes.number} font-bold text-gray-900`}>{postsCount}</div>
            <div className={`${classes.label} text-gray-500 ${classes.margin}`}>POSTS</div>
          </div>
        )}

        {/* Followers */}
        <div 
          className="text-left border-r border-gray-300 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => userId && setShowFollowersModal(true)}
        >
          <div className={`${classes.number} font-bold text-gray-900`}>{formatNumber(followersCount)}</div>
          <div className={`${classes.label} text-gray-500 ${classes.margin}`}>FOLLOWERS</div>
        </div>

        {/* Following */}
        <div 
          className="text-left cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => userId && setShowFollowingModal(true)}
        >
          <div className={`${classes.number} font-bold text-gray-900`}>{formatNumber(followingCount)}</div>
          <div className={`${classes.label} text-gray-500 ${classes.margin}`}>FOLLOWING</div>
        </div>

        {/* Modals */}
        {userId && (
          <>
            <FollowersFollowingModal
              isOpen={showFollowersModal}
              onClose={() => setShowFollowersModal(false)}
              userId={userId}
              type="followers"
              title="Followers"
            />
            <FollowersFollowingModal
              isOpen={showFollowingModal}
              onClose={() => setShowFollowingModal(false)}
              userId={userId}
              type="following"
              title="Following"
            />
          </>
        )}
      </div>
    </div>
  );
};

const LevelBadges: React.FC<{ profile: UserProfileResponse }> = ({ profile }) => {
  const navigate = useNavigate();
  const calculateXPProgress = (): { current: number; max: number; percentage: number } => {
    if (!profile.level || !profile.xpPoints) {
      return { current: 0, max: 2000, percentage: 0 };
    }
    // Assuming each level requires 2000 XP
    const currentLevelXP = (profile.level - 1) * 2000;
    const currentXP = profile.xpPoints - currentLevelXP;
    const maxXP = 200;
    const percentage = Math.min((currentXP / maxXP) * 100, 100);
    return { current: currentXP, max: maxXP, percentage };
  };

  const xpProgress = calculateXPProgress();

  if (!profile.level) return null;

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white rounded-3xl">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-700">Level {profile.level}</span>
          </div>
          <div className="text-base text-gray-500 font-light">
            {/* {xpProgress.current}/{xpProgress.max} XP */}
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-[#15B8A6] h-3 rounded-full transition-all duration-300"
            style={{ width: `${xpProgress.percentage}%` }}
          ></div>
        </div>
      </div>

      {profile.badges && profile.badges.length > 0 && (
        <div>
          <h3 className="text-base text-[#15B8A6] font-semibold mb-2 italic">Recent Badges:</h3>
          <div className="flex gap-2">
            {profile.badges.slice(0, 4).map((badge) => (
              <div
                key={badge.id}
                className="w-14 h-14 rounded-full bg-[#15B8A6]/10 flex items-center justify-center"
                title={badge.name}
              >
                {badge.iconUrl ? (  
                  <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10" />
                ) : (
                  <CameraIcon className="w-8 h-8 text-white" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="secondary"
        className="w-full rounded-xl"
        onClick={() => {
          navigate("/ranking");
        }}
      >
        View Leaderboard
      </Button>
    </div>


  );
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  postsCount,
  onFollow,
}) => {
  return (
    <div className="flex w-full h-full gap-6 items-start items-stretch">
  
      <div className="flex-1 bg-white rounded-3xl p-6">
        <ProfileHeaderSection
          profile={profile}
          isOwnProfile={isOwnProfile}
          postsCount={postsCount}
          onFollow={onFollow}
        />
      </div>

      <div className="h-[280px] aspect-square max-w-[320px] flex-shrink-0 bg-white rounded-3xl p-6">
        <LevelBadges profile={profile} />
      </div>
  </div>
  );
};
