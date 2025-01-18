import React from "react";
import { supabase } from "@/lib/supabase";

// Function to encode the uploaded photo as Base64 and update the database
export const handlePhotoUpload = async (
  event: React.ChangeEvent<HTMLInputElement>,
  userId: string,
  updateUserPhoto: (photo: string) => void
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result?.toString().split(",")[1]; // Get base64 string
      if (!base64String) return;

      // Save the base64 string in the database
      const { error } = await supabase
        .from("usertable")
        .update({ photo: base64String })
        .eq("user_id_text", userId);

      if (error) {
        console.error("Error uploading photo:", error);
      } else {
        updateUserPhoto(base64String); // Update state with new photo
      }
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error("Error handling photo upload:", error);
  }
};

// Function to decode a Base64 photo and return an image element
export const PhotoDisplay: React.FC<{ base64Photo: string }> = ({ base64Photo }) => {
  if (!base64Photo) {
    return <p>No photo available.</p>;
  }

  return (
    <img
      src={`data:image/jpeg;base64,${base64Photo}`}
      alt="Profile"
      className="mt-2 w-32 h-32 object-cover"
    />
  );
};

// See implementation in ../pages/CreaeProfile.tsx (lines 6, 210 - 225)