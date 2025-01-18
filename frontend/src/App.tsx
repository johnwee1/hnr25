import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useState, useEffect } from "react";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Home } from "./pages/Home";
import { CreateProfile } from "./pages/CreateProfile";
import { AuthTokenResponsePassword } from "@supabase/supabase-js";

function App() {
  const [token, setToken] = useState<AuthTokenResponsePassword["data"] | false>(
    false,
  );
  if (token) {
    sessionStorage.setItem("token", JSON.stringify(token));
  }

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      const data = JSON.parse(sessionStorage.getItem("token")!);
      setToken(data);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/createprofile" element={<CreateProfile />} />
        {token ? <Route path={"/home"} element={<Home token={token} />} /> : ""}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
