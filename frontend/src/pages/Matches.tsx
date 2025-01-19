import { AuthTokenResponsePassword } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Profile, ProfileCard } from "../components/profile-card";

export function Matches({ token }: { token: AuthTokenResponsePassword["data"] }) {
  const [matchedProfiles, setMatchedProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    console.log("useEffect triggered, calling fetchMatchedProfiles");
    fetchMatchedProfiles();
  }, []);

  const fetchMatchedProfiles = async () => {
    if (!token.user) {
      console.error("No user found in token");
      return;
    }

    console.log("Fetching matches for user:", token.user.id);

    try {
      // Fetch matches where the current user is either user1_id_text or user2_id_text
      const { data: matches, error: matchesError } = await supabase
        .from("matchestable")
        .select("user1_id_text, user2_id_text")
        .or(`user1_id_text.eq.${token.user.id},user2_id_text.eq.${token.user.id}`);

      console.log("Matches fetched:", matches);

      if (matchesError) {
        console.error("Error fetching matches:", matchesError);
        return;
      }

      if (matches && matches.length > 0) {
        console.log("Matches found, processing matched user IDs");

        // Collect IDs of matched users
        const matchedUserIds = matches.map((match) =>
          match.user1_id_text === token.user.id ? match.user2_id_text : match.user1_id_text
        );

        console.log("Matched user IDs:", matchedUserIds);

        // Fetch profiles of matched users
        const { data: profiles, error: profilesError } = await supabase
          .from("usertable")
          .select("*")
          .in("user_id_text", matchedUserIds);

        console.log("Profiles fetched:", profiles);

        if (profilesError) {
          console.error("Error fetching matched profiles:", profilesError);
        } else {
          setMatchedProfiles(profiles || []);
          console.log("Matched profiles set in state:", profiles);
        }
      } else {
        console.log("No matches found for the user");
        setMatchedProfiles([]);
      }
    } catch (error) {
      console.error("Unexpected error fetching matched profiles:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Your Matches</h1>
      {matchedProfiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {matchedProfiles.map((profile) => (
            <ProfileCard key={profile.user_id_text} profile={profile} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-8">
          No matches found yet. Start swiping to find your match!
        </p>
      )}
    </div>
  );
}
