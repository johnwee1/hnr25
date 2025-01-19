import { AuthTokenResponsePassword } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { handlePhotoUpload, PhotoDisplay } from "../components/photos";
import LoadingAnimation from "../components/loading";

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
  const [isGenderPreferenceVisible, setGenderPreferenceVisible] =
    useState(false); // Toggle preference visibility
  const [selectedPreferences, setSelectedGenderPreferences] = useState<
    string[]
  >([]); // Track selected gender preferences
  const [ageRanges, setAgeRanges] = useState<AgeRange[]>([]); // Store all available age ranges
  const [isAgePreferenceVisible, setAgePreferenceVisible] = useState(false); // Toggle age preference visibility
  const [selectedAgePreferences, setSelectedAgePreferences] = useState<
    string[]
  >([]); // Track selected age preferences
  const navigate = useNavigate();
  const userId = token.session.user.id;
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || !token.user) {
        console.error("No user found in token");
        navigate("/login"); // Redirect to login if no userId found
        return;
      }

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

        // Fetch gender preferences
        const { data: genderPreferences, error: genderPreferencesError } =
          await supabase
            .from("genderpreferencetable")
            .select("genderid")
            .eq("user_id_text", userId);

        if (genderPreferencesError) {
          console.error(
            "Error fetching gender preferences:",
            genderPreferencesError,
          );
        } else if (genderPreferences) {
          const preferences = genderPreferences.map((row) => row.genderid);
          setSelectedGenderPreferences(preferences);
        }

        // Fetch age preferences
        const { data: agePreferences, error: agePreferencesError } =
          await supabase
            .from("agepreferencetable")
            .select("agerangeid")
            .eq("user_id_text", userId);

        if (agePreferencesError) {
          console.error("Error fetching age preferences:", agePreferencesError);
        } else if (agePreferences) {
          const preferences = agePreferences.map((row) => row.agerangeid);
          setSelectedAgePreferences(preferences);
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

    const fetchAllAgeRanges = async () => {
      try {
        const { data, error } = await supabase
          .from("agerangetable")
          .select("*");

        if (error) {
          console.error("Error fetching age ranges:", error);
        } else if (data) {
          setAgeRanges(data);
        }
      } catch (error) {
        console.error("Error fetching age ranges:", error);
      }
    };

    fetchUserData();
    fetchAllGenders();
    fetchAllAgeRanges();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingAnimation />
      </div>
    ); 
  }

  if (!userData) {
    return (
      <div className={className} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
            <CardDescription>
              Create your profile by filling out the form.
            </CardDescription>
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setNewValue(e.target.value);
  };

  const handleSave = async () => {
    console.log("saving...");
    if (!editField || !newValue) return;

    try {
      // Check if the field being edited is age
      if (editField === "age") {
        // Fetch the corresponding agerangeid for the new age
        const { data: ageRangeData, error: rangeError } = await supabase
          .from("agerangetable")
          .select("agerangeid")
          .lte("min_age", newValue) // Less than or equal to newValue
          .gte("max_age", newValue) // Greater than or equal to newValue
          .single(); // Ensure only one range matches

        if (rangeError) {
          console.error("Error fetching age range:", rangeError);
          return;
        }

        if (!ageRangeData) {
          console.error("No matching age range found for the given age.");
          return;
        }

        const newAgerangeId = ageRangeData.agerangeid;

        // Update the user's age and agerangeid in the database
        const { error } = await supabase
          .from("usertable")
          .update({ age: newValue, agerangeid: newAgerangeId }) // Update both fields
          .eq("user_id_text", token.user?.id);

        if (error) {
          console.error("Error updating age and age range:", error);
          return;
        }
      } else {
        // For non-age fields, only update the specific field
        const { error } = await supabase
          .from("usertable")
          .update({ [editField]: newValue })
          .eq("user_id_text", token.user?.id);

        if (error) {
          console.error("Error updating profile:", error);
          return;
        }
      }

      // Refetch the updated user data
      console.log("refetch");
      const { data, error: fetchError } = await supabase
        .from("usertable")
        .select(
          "name, age, genderid, agerangeid, description, photo, credits, price",
        )
        .eq("user_id_text", token.user?.id)
        .single();

      if (fetchError) {
        console.error("Error fetching updated user data:", fetchError);
      } else if (
        data &&
        data.age >= 18 &&
        data.description &&
        data.genderid &&
        data.name &&
        data.photo &&
        data.description
      ) {
        setUserData(data);
        console.log("all data inputted");
        // check if all fields are filled
        try {
          const response = await supabase
            .from("initialProfileCreatedTable")
            .select("user_id_text")
            .eq("user_id_text", userId);
          if (response.error) throw response.error;
          console.log(response);
          if (response.data.length === 0) {
            // Insert the userId
            const { error: insertError } = await supabase
              .from("initialProfileCreatedTable")
              .insert([{ user_id_text: userId }]);

            if (insertError) throw insertError;

            // Execute your function here disburse credits
            // const rpcResp = await supabase.rpc("disburse_credits", {
            //   userid: userId,
            //   amount: 10,
            // });
            // set credits to 10
            const { error: updateCreditsError } = await supabase
              .from("usertable")
              .update({ credits: 10 })
              .eq("user_id_text", userId);
          }
        } catch (error) {
          console.error("Error checking if user exists:", error);
        }

        // fetchGenderName(data.genderid); // Fetch updated gender name if necessary
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
        const selectedGender = genders.find(
          (gender) => gender.genderid === genderid,
        );
        if (selectedGender) {
          setGenderName(selectedGender.gendername);
        }
        setGenderDropdownVisible(false);
      }
    } catch (error) {
      console.error("Error updating gender:", error);
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
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
          .eq("user_id_text", token.user?.id);

        if (error) {
          console.error("Error uploading photo:", error);
        } else {
          setUserData((prev) => prev && { ...prev, photo: base64String });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error handling photo upload:", error);
    }
  };

  const handleSaveGenderPreferences = async () => {
    try {
      // Fetch current gender preferences from the database
      const { data: existingPreferences, error: fetchError } = await supabase
        .from("genderpreferencetable")
        .select("genderid")
        .eq("user_id_text", token.user?.id);

      if (fetchError) {
        console.error("Error fetching current gender preferences:", fetchError);
        return;
      }

      const existingGenderIds =
        existingPreferences?.map((pref) => pref.genderid) || [];

      // Determine which preferences to add and which to remove
      const preferencesToAdd = selectedPreferences.filter(
        (id) => !existingGenderIds.includes(id),
      );
      const preferencesToRemove = existingGenderIds.filter(
        (id) => !selectedPreferences.includes(id),
      );

      // Perform insertions for new preferences
      if (preferencesToAdd.length > 0) {
        const { error: insertError } = await supabase
          .from("genderpreferencetable")
          .insert(
            preferencesToAdd.map((id) => ({
              user_id_text: token.user?.id,
              genderid: id,
            })),
          );

        if (insertError) {
          console.error("Error adding gender preferences:", insertError);
          return;
        }
      }

      // Perform deletions for removed preferences
      if (preferencesToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("genderpreferencetable")
          .delete()
          .eq("user_id_text", token.user?.id)
          .in("genderid", preferencesToRemove);

        if (deleteError) {
          console.error("Error removing gender preferences:", deleteError);
          return;
        }
      }

      console.log("Gender preferences updated successfully");
      setGenderPreferenceVisible(false);
    } catch (error) {
      console.error("Error saving gender preferences:", error);
    }
  };

  const handleGenderPreferenceChange = (genderid: string) => {
    setSelectedGenderPreferences((prev) =>
      prev.includes(genderid)
        ? prev.filter((id) => id !== genderid)
        : [...prev, genderid],
    );
  };

  const handleSaveAgePreferences = async () => {
    try {
      // Fetch current age preferences from the database
      const { data: existingPreferences, error: fetchError } = await supabase
        .from("agepreferencetable")
        .select("agerangeid")
        .eq("user_id_text", token.user?.id);

      if (fetchError) {
        console.error("Error fetching current age preferences:", fetchError);
        return;
      }

      const existingAgeRangeIds =
        existingPreferences?.map((pref) => pref.agerangeid) || [];

      // Determine which preferences to add and which to remove
      const preferencesToAdd = selectedAgePreferences.filter(
        (id) => !existingAgeRangeIds.includes(id),
      );
      const preferencesToRemove = existingAgeRangeIds.filter(
        (id) => !selectedAgePreferences.includes(id),
      );

      // Perform insertions for new preferences
      if (preferencesToAdd.length > 0) {
        const { error: insertError } = await supabase
          .from("agepreferencetable")
          .insert(
            preferencesToAdd.map((id) => ({
              user_id_text: token.user?.id,
              agerangeid: id,
            })),
          );

        if (insertError) {
          console.error("Error adding age preferences:", insertError);
          return;
        }
      }

      // Perform deletions for removed preferences
      if (preferencesToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("agepreferencetable")
          .delete()
          .eq("user_id_text", token.user?.id)
          .in("agerangeid", preferencesToRemove);

        if (deleteError) {
          console.error("Error removing age preferences:", deleteError);
          return;
        }
      }

      console.log("Age preferences updated successfully");
      setAgePreferenceVisible(false);
    } catch (error) {
      console.error("Error saving age preferences:", error);
    }
  };

  const handleAgePreferenceChange = (agerangeid: string) => {
    setSelectedAgePreferences((prev) =>
      prev.includes(agerangeid)
        ? prev.filter((id) => id !== agerangeid)
        : [...prev, agerangeid],
    );
  };

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>
            View and edit your profile details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userData.photo ? (
            <div>
              <strong>Photo:</strong>
              <img
                src={`data:image/jpeg;base64,${userData.photo}`}
                alt="Profile"
                className="mt-2 w-32 h-32 object-cover"
              />
            </div>
          ) : (
            <p>No photo available.</p>
          )}

          {/* Photo Upload */}
          <div className="mt-4">
            <label htmlFor="photoUpload" className="block font-medium">
              Upload Photo:
            </label>
            <input
              type="file"
              id="photoUpload"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="mt-2"
            />
          </div>

          <p className="text-blue-500 text-sm pb-4">
            Click on the blue info to edit
          </p>

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
              <p
                onClick={() => handleEditField("name", userData.name || "")}
                className="text-blue-500"
              >
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
                max={100}
              />
            ) : (
              <p
                onClick={() => handleEditField("age", userData.age || "")}
                className="text-blue-500"
              >
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
                <p
                  onClick={() =>
                    setGenderDropdownVisible(!isGenderDropdownVisible)
                  }
                  className="text-blue-500"
                >
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
              <p
                onClick={() =>
                  handleEditField("description", userData.description || "")
                }
                className="text-blue-500"
              >
                <strong>Description:</strong> {userData.description || ""}
              </p>
            )}

            <div className="profile-details space-y-4">
              {/* Gender Preferences */}
              <p
                onClick={() =>
                  setGenderPreferenceVisible(!isGenderPreferenceVisible)
                }
                className="text-blue-500 cursor-pointer"
              >
                <strong>Gender Preferences:</strong>{" "}
                {selectedPreferences.length > 0
                  ? selectedPreferences
                      .map(
                        (id) =>
                          genders.find((g) => g.genderid === id)?.gendername,
                      )
                      .join(", ")
                  : "None"}
              </p>

              {isGenderPreferenceVisible && (
                <div className="space-y-2 mt-2">
                  {genders.map((gender) => (
                    <div
                      key={gender.genderid}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`preference-${gender.genderid}`}
                        checked={selectedPreferences.includes(gender.genderid)}
                        onChange={() =>
                          handleGenderPreferenceChange(gender.genderid)
                        }
                      />
                      <label htmlFor={`preference-${gender.genderid}`}>
                        {gender.gendername}
                      </label>
                    </div>
                  ))}
                  <Button
                    onClick={handleSaveGenderPreferences}
                    className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Save Preferences
                  </Button>
                </div>
              )}

              {/* Age Preferences */}
              <p
                onClick={() => setAgePreferenceVisible(!isAgePreferenceVisible)}
                className="text-blue-500 cursor-pointer"
              >
                <strong>Age Preferences:</strong>{" "}
                {selectedAgePreferences.length > 0
                  ? selectedAgePreferences
                      .map((id) => {
                        const range = ageRanges.find(
                          (a) => a.agerangeid === id,
                        );
                        return range ? `${range.min_age}-${range.max_age}` : "";
                      })
                      .join(", ")
                  : "None"}
              </p>

              {isAgePreferenceVisible && (
                <div className="space-y-2 mt-2">
                  {ageRanges.map((range) => (
                    <div
                      key={range.agerangeid}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`preference-${range.agerangeid}`}
                        checked={selectedAgePreferences.includes(
                          range.agerangeid,
                        )}
                        onChange={() =>
                          handleAgePreferenceChange(range.agerangeid)
                        }
                      />
                      <label htmlFor={`preference-${range.agerangeid}`}>
                        {range.min_age} - {range.max_age}
                      </label>
                    </div>
                  ))}
                  <Button
                    onClick={handleSaveAgePreferences}
                    className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Save Preferences
                  </Button>
                </div>
              )}
            </div>

            <p>
              <strong>Credits:</strong> {userData.credits || "0"}
            </p>
            <p>
              <strong>Price:</strong> {userData.price || "0"}
            </p>

            {editField && (
              <div className="mt-4 flex space-x-2">
                <Button
                  onClick={handleSave}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
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
