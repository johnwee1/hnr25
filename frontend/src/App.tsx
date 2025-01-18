import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, ReactNode } from "react";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Home } from "./pages/Home";
import { AuthTokenResponsePassword } from "@supabase/supabase-js";

// Optional: Define a Loading component
const Loading = () => <div>Loading...</div>;

// ProtectedRoute Component
interface ProtectedRouteProps {
  token: AuthTokenResponsePassword["data"] | false;
  children: ReactNode;
}

const ProtectedRoute = ({ token, children }: ProtectedRouteProps) => {
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// PublicRoute Component to Redirect Authenticated Users
interface PublicRouteProps {
  token: AuthTokenResponsePassword["data"] | false;
  children: ReactNode;
}

const PublicRoute = ({ token, children }: PublicRouteProps) => {
  if (token) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

function App() {
  const [token, setToken] = useState<AuthTokenResponsePassword["data"] | false>(
    false,
  );
  const [isLoading, setIsLoading] = useState(true); // Optional: Add loading state

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      try {
        const data = JSON.parse(storedToken);
        setToken(data);
      } catch (error) {
        console.error("Error parsing token from sessionStorage:", error);
        setToken(false);
      }
    }
    setIsLoading(false); // Finished loading
  }, []);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem("token", JSON.stringify(token));
    } else {
      sessionStorage.removeItem("token"); // Clean up if token is false
    }
  }, [token]);

  if (isLoading) {
    return <Loading />; // Show loading indicator while checking token
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route: Login */}
        <Route
          path="/"
          element={
            <PublicRoute token={token}>
              <Login setToken={setToken} />
            </PublicRoute>
          }
        />

        {/* Public Route: Register */}
        <Route path="/register" element={<Register />} />

        {/* Protected Route: Home */}
        <Route
          path="/home"
          element={
            <ProtectedRoute token={token}>
              <Home token={token} />
            </ProtectedRoute>
          }
        />

        {/* Catch-All Route: Redirect to Home or Login based on Auth */}
        <Route
          path="*"
          element={
            token ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
