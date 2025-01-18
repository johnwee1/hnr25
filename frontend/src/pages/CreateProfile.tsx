import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function CreateProfile() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [agePreference, setAgePreference] = useState("");
  const [genderPreference, setGenderPreference] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Function to convert the photo to Base64
  const encodeImageToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result.toString()); // Resolving the Base64 string
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file); // Read the file as Base64
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let photoUrl = "";
    if (photo) {
      try {
        // Convert photo to Base64 string
        const base64Photo = await encodeImageToBase64(photo);
        photoUrl = base64Photo; // Store the Base64 string
      } catch (err) {
        setError("Failed to encode photo.");
        return;
      }
    }

    const { data, error } = await supabase.from("usertable").insert({
      name,
      photo: photoUrl, // Save the Base64 string or URL depending on your use case
      gender,
      age: parseInt(age, 10),
      description,
      age_preference: agePreference,
      gender_preference: genderPreference,
    });

    if (error) {
      setError("Failed to create profile.");
      console.error(error.message);
    } else {
      alert("Profile created successfully!");
      navigate("/"); // Redirect to a different page after success
    }
  }

  return (
    <div>
      <h2>Create Profile</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>
        <div>
          <label>Photo:</label>
          <input
            type="file"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            accept="image/*"
            required
          />
        </div>
        <div>
          <label>Gender:</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} required>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label>Age:</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about yourself"
            required
          />
        </div>
        <div>
          <label>Age Preference:</label>
          <input
            type="text"
            value={agePreference}
            onChange={(e) => setAgePreference(e.target.value)}
            placeholder="E.g., 20-30"
            required
          />
        </div>
        <div>
          <label>Gender Preference:</label>
          <select
            value={genderPreference}
            onChange={(e) => setGenderPreference(e.target.value)}
            required
          >
            <option value="">Select Gender Preference</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="any">Any</option>
          </select>
        </div>
        <button type="submit">Create Profile</button>
      </form>
    </div>
  );
}
