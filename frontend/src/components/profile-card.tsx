import React from "react";

interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  market_value: number;
}

interface ProfileCardProps {
  profile: Profile;
  onSwipe: (id: string, cost: number) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onSwipe,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{profile.name}</h2>
        <p className="text-gray-600 mb-2">Age: {profile.age}</p>
        <p className="text-gray-700 mb-4">{profile.bio}</p>
        <p className="text-green-600 font-semibold mb-4">
          Market Value: ${profile.market_value}
        </p>
        <button
          onClick={() => onSwipe(profile.id, profile.market_value)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Swipe
        </button>
      </div>
    </div>
  );
};
