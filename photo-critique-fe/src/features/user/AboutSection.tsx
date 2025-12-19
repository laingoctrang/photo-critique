import type { UserProfileResponse } from "../../services";
import { formatDateLongMonth } from "../../utils/dateUtils";

interface AboutSectionProps {
  profile: UserProfileResponse;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  return (
    <div className="space-y-4">
      {profile.bio && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Bio</h3>
          <p className="text-gray-600">{profile.bio}</p>
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Joined</h3>
        <p className="text-gray-600">
          {formatDateLongMonth(profile.createdAt)}
        </p>
      </div>
    </div>
  );
};

