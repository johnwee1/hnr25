import React, { useState } from "react";
import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface Profile {
  user_id_text: string;
  name: string;
  age: number;
  genderid: string;
  description: string;
  photo: string;
  credits: number;
  price: number;
}

interface ProfileCardProps {
  profile: Profile;
  onSwipe: (id: string, cost: number) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSwipe }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Card Component */}
      <div
        onClick={() => setIsOpen(true)}
        className="relative h-[400px] bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group"
      >
        {/* Image Container */}
        <div className="absolute inset-0">
          <img
            src={`data:image/jpeg;base64,${profile.photo}` || 'https://via.placeholder.com/400x400'}
            alt={`${profile.name}'s profile`}
            className="w-full h-full object-cover transition-all duration-300 group-hover:blur-sm"
          />
          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
        </div>

        {/* Default View - Name Only */}
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h2 className="text-xl font-semibold text-white drop-shadow-lg">
            {profile.name}
          </h2>
        </div>

        {/* Hover View - Additional Info */}
        <div className="absolute inset-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-white">
          <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
          <p className="text-lg mb-1">{profile.age} years old</p>
          <p className="text-lg mb-1">{profile.genderid}</p>
          <p className="text-lg font-semibold">Value: ${profile.price}</p>
        </div>
      </div>

      {/* Dialog Component */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl">
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{profile.name}</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="flex gap-6">
              <img
                src={`data:image/jpeg;base64,${profile.photo}` || 'https://via.placeholder.com/400x400'}
                alt={`${profile.name}'s profile`}
                className="w-1/2 h-[300px] object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="space-y-2">
                  <p className="text-lg"><span className="font-semibold">Age:</span> {profile.age}</p>
                  <p className="text-lg"><span className="font-semibold">Gender:</span> {profile.genderid}</p>
                  <p className="text-lg"><span className="font-semibold">Market Value:</span> ${profile.price}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Bio</h3>
              <p className="text-gray-700">{profile.description}</p>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSwipe(profile.user_id_text, profile.price);
                  setIsOpen(false);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Swipe
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};