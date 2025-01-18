import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useState, useEffect } from "react";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Home } from "./pages/Home";

export interface Token {
  user: {
    user_metadata: {
      full_name: string;
    };
  };
}

function App() {
  const [token, setToken] = useState<Token | false>(false);
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
        {token ? <Route path={"/home"} element={<Home token={token} />} /> : ""}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
