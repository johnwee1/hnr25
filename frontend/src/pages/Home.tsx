import { AuthTokenResponsePassword } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import {supabase} from "../lib/supabase";
import { addAbortSignal } from "node:stream";

interface Profile {
  id: string
  name: string
  age: number
  bio: string
  market_value: number
}

export function Home({ token }: { token: AuthTokenResponsePassword["data"] }) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [credits, setCredits] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfiles()
    fetchCredits()
  }, [])

  const fetchProfiles = async () => {
    if (!token.user) {
      console.error("No user found in token");
      return;
    }

    const { data, error } = await supabase
      .from('usertable')
      .select('*')
      .neq('id', token.user.id)
      .limit(10)
    if (error) console.error('Error fetching profiles:', error)
    else setProfiles(data || [])

    console.log(data)
  }

  const fetchCredits = async () => {
      // Example fetch function for credits, replace with your logic
      const { data, error } = await supabase
        .from('usertable')
        .select('credits')
        .eq('user_id', token.user?.id)
        .single();
  
      if (error) {
        console.error('Error fetching credits:', error)
      } else { 
        setCredits(data?.credits || 0);
      }

      console.log(data)
  }

  const handleSwipe = async (swipedOnId: string, cost: number) => {
    if (credits < cost) {
      alert("Not enough credits!")
      return
    }

    // Insert into swipe table
    const { error: swipeError } = await supabase
      .from('swipes')
      .insert({
        swiper_id: token.user?.id,
        swiped_on_id: swipedOnId,
        cost: cost
      })

    if (swipeError) {
      console.error('Error recording swipe:', swipeError)
      return
    }

    // Minus credits
    const { error: creditError } = await supabase
      .from('usertable')
      .update({ credits: credits - cost }) 
      .eq('user_id', token.user?.id);

    if (creditError) {
      console.error('Error updating credits:', creditError)
    } else {
      setCredits(credits - cost);
    }

    // Check for a match
    let matched = false;
    const { data: matchData, error: matchError } = await supabase
      .from("swipes")
      .select("*")
      .eq("swiper_id", swipedOnId) // Check if the swiped user swiped back on the current user
      .eq("swiped_on_id", token.user?.id);

    if (matchError) {
      console.error("Error while finding match:", matchError);
    } else if (matchData && matchData.length > 0) {
      matched = true;
      alert("It's a match! 🎉"); // Notify the user of the match
      // Add additional logic for matches here (e.g., updating a matches table)
    }

    // Refresh Profiles
    fetchProfiles();
  }

  function handleLogout() {
    sessionStorage.removeItem("token");
    window.location.reload();
  }

  return (
    <div>
      <h1>Home</h1>
      <h3>Welcome back, {token.user!.user_metadata.full_name}</h3>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
