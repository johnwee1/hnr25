import { AuthTokenResponsePassword } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Profile, ProfileCard } from "../components/profile-card";

export function Home({ token }: { token: AuthTokenResponsePassword["data"] }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [credits, setCredits] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
    fetchCredits();
  }, []);

  console.log(profiles);

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
    console.log("Handling swipe...", { swipedOnId, cost, credits });
  
    if (credits < cost) {
      console.log("Not enough credits!");
      alert("Not enough credits!");
      return;
    }
  
    console.log("Inserting swipe into swipes table...");
    const { error: swipeError } = await supabase.from("swipetable").insert({
      swiper_id_text: token.user?.id,
      swipedon_id_text: swipedOnId,
    });
  
    if (swipeError) {
      console.error("Error recording swipe:", swipeError);
      return;
    } else {
      console.log("Swipe successfully recorded.");
    }
  
    console.log("Updating user credits...");
    const { error: creditError } = await supabase
      .from("usertable")
      .update({ credits: credits - cost })
      .eq("user_id_text", token.user?.id);
  
    if (creditError) {
      console.error("Error updating credits:", creditError);
    } else {
      console.log(`Credits updated. Remaining credits: ${credits - cost}`);
      setCredits(credits - cost);
    }
  
    console.log("Checking for a match...");
    const { data: matchData, error: matchError } = await supabase
      .from("swipetable")
      .select("*")
      .eq("swiper_id_text", swipedOnId)
      .eq("swipedon_id_text", token.user?.id);
  
    if (matchError) {
      console.error("Error checking for match: ", matchError);
    } else if (matchData && matchData.length > 0) {
      console.log("It's a match! 🎉");
      alert("It's a match! 🎉");
  
      const newMatch = {
        match_id: Date.now(),
        user1_id_text: token.user?.id,
        user2_id_text: swipedOnId,
        match_date: new Date().toISOString(),
      };
  
      console.log("Checking if match already exists...");
      const { data: existingMatch, error: matchCheckError } = await supabase
        .from("matchestable")
        .select("user1_id_text, user2_id_text")
        .or(
          `and(user1_id_text.eq.${newMatch.user1_id_text},user2_id_text.eq.${newMatch.user2_id_text}),and(user1_id_text.eq.${newMatch.user2_id_text},user2_id_text.eq.${newMatch.user1_id_text})`
        );
      
      if (matchCheckError) {
        console.error("Error checking for existing match: ", matchCheckError);
        return;
      }
      
      if (existingMatch && existingMatch.length > 0) {
        console.log("Match already exists, skipping insert.");
      } else {
        console.log("Inserting new match into matchestable...", newMatch);
        const { error: insertError } = await supabase
          .from("matchestable")
          .insert(newMatch);
      
        if (insertError) {
          console.error("Error while inserting new match: ", insertError);
        } else {
          console.log("Match successfully recorded: ", newMatch);
        }
      }
      
  
      console.log("Fetching profiles again...");
      fetchProfiles();
    } else {
      console.log("No match found.");
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
      <h3 className="text-xl mb-4">Welcome back! Let's find you a match...</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.user_id_text}
            profile={profile}
            onSwipe={handleSwipe}
          />
        ))}
      </div>
    </div>
  );
}
