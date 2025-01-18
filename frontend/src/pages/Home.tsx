import { AuthTokenResponsePassword } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ProfileCard } from "../components/profile-card";
// import { addAbortSignal } from "node:stream";

interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  market_value: number;
}

export function Home({ token }: { token: AuthTokenResponsePassword["data"] }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [credits, setCredits] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
    fetchCredits();
  }, []);

  const fetchProfiles = async () => {
    if (!token.user) {
      console.error("No user found in token");
      return;
    }

    const { data, error } = await supabase
      .from("usertable")
      .select("*")
      .neq("user_id_text", token.user.id)
      .limit(10);
    if (error) console.error("Error fetching profiles:", error);
    else setProfiles(data || []);

    console.log(data);
  };

  const fetchCredits = async () => {
    // Example fetch function for credits, replace with your logic
    const { data, error } = await supabase
      .from("usertable")
      .select("credits")
      .eq("user_id_text", token.user?.id)
      .single();

    if (error) {
      console.error("Error fetching credits:", error);
    } else {
      setCredits(data?.credits || 0);
    }

    console.log(data);
  };

  const handleSwipe = async (swipedOnId: string, cost: number) => {
    if (credits < cost) {
      alert("Not enough credits!");
      return;
    }

    // Insert into swipe table
    const { error: swipeError } = await supabase.from("swipes").insert({
      swiper_id: token.user?.id,
      swiped_on_id: swipedOnId,
      cost: cost,
    });

    if (swipeError) {
      console.error("Error recording swipe:", swipeError);
      return;
    }

    // Minus credits
    const { error: creditError } = await supabase
      .from("usertable")
      .update({ credits: credits - cost })
      .eq("user_id", token.user?.id);

    if (creditError) {
      console.error("Error updating credits:", creditError);
    } else {
      setCredits(credits - cost);
    }

    // Check for a match
    const { data: matchData, error: matchError } = await supabase
      .from("swipetable")
      .select("*")
      .eq("swiper_id", swipedOnId) // Check if the swiped user swiped back on the current user
      .eq("swiped_on_id", token.user?.id);

    if (matchError) {
      console.error("No match: ", matchError);
    } else if (matchData && matchData.length > 0) {
      alert("It's a match! 🎉"); // Notify the user of the match

      // Update Match Table
      const { data: matchData, error: matchError } = await supabase
        .from("matchestables")
        .select("*")
        .eq("swiper_id", swipedOnId) // Check if the swiped user swiped back on the current user
        .eq("swiped_on_id", token.user?.id);

      if (matchError) {
        console.error("Error while assigning match: ", matchError);
      } else if (matchData && matchData.length > 0) {
        alert("It's a match! 🎉"); // Notify the user of the match

        const newMatch = {
          match_id: Date.now(), // Use a timestamp as a unique ID (or replace with your custom logic)
          user1_id: token.user?.id, // Current user
          user2_id: swipedOnId, // Swiped user
          match_date: new Date().toISOString(), // Current timestamp
        };

        const { error: insertError } = await supabase
          .from("matchestables")
          .insert(newMatch);

        if (insertError) {
          console.error("Error while inserting new match: ", insertError);
        } else {
          console.log("Match successfully recorded: ", newMatch);
        }

        // Further Action, show socials etc etc
        //
      }

      // Refresh Profiles
      fetchProfiles();
    }
  };

  function handleLogout() {
    sessionStorage.removeItem("token");
    window.location.reload();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Home</h1>
      <h3 className="text-xl mb-4">
        Welcome back, {token.user!.user_metadata.full_name}
      </h3>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mb-8"
      >
        Logout
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onSwipe={handleSwipe} // Pass the required `onSwipe` prop
          />
        ))}
      </div>
    </div>
  );
}
