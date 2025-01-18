import { Token } from "@/App";
export function Home({ token }: { token: Token }) {
  function handleLogout() {
    sessionStorage.removeItem("token");
    window.location.reload();
  }

  return (
    <div>
      <h1>Home</h1>
      <h3>Welcome back, {token.user.user_metadata.full_name}</h3>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
