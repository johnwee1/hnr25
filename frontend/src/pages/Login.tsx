import { cn } from "../lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthTokenResponsePassword } from "@supabase/supabase-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  setToken: React.Dispatch<
    React.SetStateAction<AuthTokenResponsePassword["data"] | false>
  >;
}

export function Login({ className, setToken, ...props }: LoginFormProps) {
  console.log("login page render");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log("Attempting to sign in with email:", email); // Log email
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in:", error); // Log error details
      alert("Error signing in: " + error.message);
    } else {
      console.log("Sign in successful, token data:", data); // Log token data
      setToken(data);

      // Check if user exists in the usertable and if user_id_text exists
      const userId = data.user?.id;
      console.log("Fetched user ID:", userId); // Log the user ID

      if (!userId) {
        console.error("No user ID found"); // Log error if no user ID
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("usertable")
        .select("*")
        .eq("user_id_text", userId)
        .single();

      if (userError) {
        console.error("Error fetching user from usertable:", userError); // Log user error
      }

      if (userError && userError.code === "PGRST116") {
        console.log("User does not exist in usertable, creating new row"); // Log if user doesn't exist
        // User does not exist, create a new row
        const { error: insertError } = await supabase
          .from("usertable")
          .insert([{ user_id_text: userId }]);

        if (insertError) {
          console.error("Error creating user:", insertError.message); // Log insert error
          alert("Error creating user. Please try again.");
          return;
        }

        console.log("New user created, redirecting to create-profile"); // Log successful user creation
        // After creating user, redirect to create profile
        navigate("/create-profile");
      } else if (userData) {
        // Check if name, age, gender, or description are null
        const { name, age, genderid, description } = userData;
        console.log("Fetched user data:", userData); // Log user data

        if (!name || !age || !genderid || !description) {
          console.log("Profile incomplete, redirecting to create-profile"); // Log incomplete profile
          // Redirect to create-profile if any of the fields are null
          navigate("/create-profile");
        } else {
          console.log("All profile fields filled, redirecting to home"); // Log if profile is complete
          // All fields are filled, redirect to home
          navigate("/home");
        }
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a
                href="#"
                className="underline underline-offset-4"
                onClick={() => navigate("/register")}
              >
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
