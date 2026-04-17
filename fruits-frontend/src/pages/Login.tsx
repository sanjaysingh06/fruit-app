import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const res = await API.post("/api/login/", {
        username,
        password,
      });

      login(res.data.access, res.data.refresh);
      navigate("/");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      
      <div className="bg-white p-6 md:p-8 rounded-xl shadow w-full max-w-md">
        
        <h2 className="text-2xl font-bold mb-6 text-center">
          🍎 Shubham Fruit Company
        </h2>

        <input
          className="w-full border p-3 rounded mb-4"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-3 rounded mb-4"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
        >
          Login
        </button>

      </div>
    </div>
  );
}

export default Login;