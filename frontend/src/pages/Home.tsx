import { AuthTokenResponsePassword } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ProfileCard } from "../components/profile-card";

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
  };

  const fetchCredits = async () => {
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
  };

  const handleSwipe = async (swipedOnId: string, cost: number) => {
    if (credits < cost) {
      alert("Not enough credits!");
      return;
    }

    const { error: swipeError } = await supabase.from("swipes").insert({
      swiper_id: token.user?.id,
      swiped_on_id: swipedOnId,
      cost: cost,
    });

    if (swipeError) {
      console.error("Error recording swipe:", swipeError);
      return;
    }

    const { error: creditError } = await supabase
      .from("usertable")
      .update({ credits: credits - cost })
      .eq("user_id", token.user?.id);

    if (creditError) {
      console.error("Error updating credits:", creditError);
    } else {
      setCredits(credits - cost);
    }

    const { data: matchData, error: matchError } = await supabase
      .from("swipetable")
      .select("*")
      .eq("swiper_id", swipedOnId)
      .eq("swiped_on_id", token.user?.id);

    if (matchError) {
      console.error("No match: ", matchError);
    } else if (matchData && matchData.length > 0) {
      alert("It's a match! 🎉");

      const newMatch = {
        match_id: Date.now(),
        user1_id: token.user?.id,
        user2_id: swipedOnId,
        match_date: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("matchestables")
        .insert(newMatch);

      if (insertError) {
        console.error("Error while inserting new match: ", insertError);
      } else {
        console.log("Match successfully recorded: ", newMatch);
      }

      fetchProfiles();
    }
  };

  function handleLogout() {
    sessionStorage.removeItem("token");
    window.location.reload();
  }

  const handleCreateProfile = () => {
    navigate("/create-profile");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Home</h1>
      <h3 className="text-xl mb-4">
        Welcome back, {token.user!.user_metadata.full_name}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onSwipe={handleSwipe}
          />
        ))}
      </div>

    </div>
  );
}
