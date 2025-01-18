import { AuthTokenResponsePassword } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UserProfile {
  name: string;
  age: number;
  genderid: string;
  description: string;
  photo: string;
  credits: number;
  price: number;
}

interface Gender {
  genderid: string;
  gendername: string;
}

interface CreateProfileProps extends React.ComponentPropsWithoutRef<"div"> {
  token: AuthTokenResponsePassword["data"] | false;
}

export function CreateProfile({
  token,
  className,
  ...props
}: CreateProfileProps) {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [genderName, setGenderName] = useState<string>(""); // Store gender name
  const [editField, setEditField] = useState<string | null>(null); // Track which field is being edited
  const [newValue, setNewValue] = useState<string | number>(""); // Hold the new value for the field
  const [genders, setGenders] = useState<Gender[]>([]); // Store all available genders
  const [isGenderDropdownVisible, setGenderDropdownVisible] = useState(false); // Toggle dropdown visibility
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || !token.user) {
        console.error("No user found in token");
        navigate("/login"); // Redirect to login if no userId found
        return;
      }

      const userId = token.user.id;
      console.log("Current User ID:", userId);

      try {
        const { data, error } = await supabase
          .from("usertable")
          .select("name, age, genderid, description, photo, credits, price")
          .eq("user_id_text", userId)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
        } else if (data) {
          setUserData(data);
          fetchGenderName(data.genderid);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchGenderName = async (genderid: string) => {
      try {
        const { data, error } = await supabase
          .from("gendertable")
          .select("gendername")
          .eq("genderid", genderid)
          .single();

        if (error) {
          console.error("Error fetching gender name:", error);
        } else if (data) {
          setGenderName(data.gendername);
        }
      } catch (error) {
        console.error("Error fetching gender name:", error);
      }
    };

    const fetchAllGenders = async () => {
      try {
        const { data, error } = await supabase.from("gendertable").select("*");

        if (error) {
          console.error("Error fetching genders:", error);
        } else if (data) {
          setGenders(data);
        }
      } catch (error) {
        console.error("Error fetching genders:", error);
      }
    };

    fetchUserData();
    fetchAllGenders();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return (
      <div className={className} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
            <CardDescription>Create your profile by filling out the form.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No profile data found. Please create your profile.</p>
            <Button onClick={() => navigate("/edit-profile")} className="mt-4">
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEditField = (field: string, value: string | number) => {
    setEditField(field);
    setNewValue(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewValue(e.target.value);
  };

  const handleSave = async () => {
    if (!editField || !newValue) return;

    try {
      const { error } = await supabase
        .from("usertable")
        .update({ [editField]: newValue })
        .eq("user_id_text", token.user?.id);

      if (error) {
        console.error("Error updating profile:", error);
      } else {
        const { data, error: fetchError } = await supabase
          .from("usertable")
          .select("name, age, genderid, description, photo, credits, price")
          .eq("user_id_text", token.user?.id)
          .single();

        if (fetchError) {
          console.error("Error fetching updated user data:", fetchError);
        } else if (data) {
          setUserData(data);
          fetchGenderName(data.genderid);
        }
      }
    } catch (error) {
      console.error("Error while saving changes:", error);
    } finally {
      setEditField(null);
      setNewValue("");
    }
  };

  const handleGenderChange = async (genderid: string) => {
    try {
      const { error } = await supabase
        .from("usertable")
        .update({ genderid })
        .eq("user_id_text", token.user?.id);

      if (error) {
        console.error("Error updating gender:", error);
      } else {
        const selectedGender = genders.find((gender) => gender.genderid === genderid);
        if (selectedGender) {
          setGenderName(selectedGender.gendername);
        }
        setGenderDropdownVisible(false);
      }
    } catch (error) {
      console.error("Error updating gender:", error);
    }
  };

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>View and edit your profile details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-blue-500 text-sm pb-4">Click on the blue info to edit</p>

          <div className="profile-details space-y-4">
            {editField === "name" ? (
              <input
                type="text"
                value={newValue}
                onChange={handleChange}
                placeholder="Input name here"
                className="border border-gray-400 bg-white p-2 w-full text-black"
              />
            ) : (
              <p onClick={() => handleEditField("name", userData.name || "")} className="text-blue-500">
                <strong>Name:</strong> {userData.name || ""}
              </p>
            )}

            {editField === "age" ? (
              <input
                type="number"
                value={newValue}
                onChange={handleChange}
                placeholder="Input age here"
                className="border border-gray-400 bg-white p-2 w-full text-black"
              />
            ) : (
              <p onClick={() => handleEditField("age", userData.age || "")} className="text-blue-500">
                <strong>Age:</strong> {userData.age || ""}
              </p>
            )}

            <div className="relative">
              {editField === "genderid" ? (
                <input
                  type="text"
                  value={newValue}
                  onChange={handleChange}
                  placeholder="Input gender here"
                  className="border border-gray-400 bg-white p-2 w-full text-black"
                />
              ) : (
                <p onClick={() => setGenderDropdownVisible(!isGenderDropdownVisible)} className="text-blue-500">
                  <strong>Gender:</strong> {genderName || "Not specified"}
                </p>
              )}
              {isGenderDropdownVisible && (
                <div className="absolute bg-white border mt-1 shadow-lg z-10 w-full">
                  {genders.map((gender) => (
                    <div
                      key={gender.genderid}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      onClick={() => handleGenderChange(gender.genderid)}
                    >
                      {gender.gendername}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {editField === "description" ? (
              <textarea
                value={newValue}
                onChange={handleChange}
                placeholder="Input description here"
                className="border border-gray-400 bg-white p-2 w-full text-black"
              />
            ) : (
              <p onClick={() => handleEditField("description", userData.description || "")} className="text-blue-500">
                <strong>Description:</strong> {userData.description || ""}
              </p>
            )}

            <p>
              <strong>Credits:</strong> {userData.credits || "0"}
            </p>
            <p>
              <strong>Price:</strong> {userData.price || "0"}
            </p>

            {editField && (
              <div className="mt-4 flex space-x-2">
                <Button onClick={handleSave} className="bg-blue-500 text-white hover:bg-blue-600">
                  Save
                </Button>
                <Button onClick={() => setEditField(null)} variant="outline">
                  Cancel
                </Button>
              </div>
            )}

            {/* Red Button to Redirect to /home */}
            <Button 
              onClick={() => navigate("/home")} 
              className="mt-4 bg-red-500 text-white hover:bg-red-600"
            >
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
