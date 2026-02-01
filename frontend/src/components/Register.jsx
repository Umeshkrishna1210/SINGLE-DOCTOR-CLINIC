import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { API_BASE } from "../config";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(UserContext) || {};

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${API_BASE}/auth/register`, {
        name,
        email,
        password,
        role,
      });

      const { token, refreshToken, user: userData } = response.data;
      if (login && token && userData) {
        login({ token, refreshToken, user: userData });
        navigate(userData.role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard", { replace: true });
      } else {
        navigate("/login");
      }
    } catch (err) {
      const data = err.response?.data;
      let msg = data?.error || "Registration failed";
      if (data?.details && Array.isArray(data.details)) {
        const detailMsg = data.details.map((d) => d.msg || d.message).join(". ");
        if (detailMsg) msg = detailMsg;
      }
      setError(msg);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl mb-4">Register</h2>
      <form onSubmit={handleRegister} className="flex flex-col space-y-3">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 rounded">
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Register
        </button>
      </form>
      <p className="text-center text-sm mt-4 text-gray-600">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
      </p>
    </div>
  );
}

export default Register;
