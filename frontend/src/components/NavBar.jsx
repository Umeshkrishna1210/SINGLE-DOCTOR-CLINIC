import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

function Navbar() {
  const { user } = useContext(UserContext) || {};
  const navigate = useNavigate(); // Initialize navigate hook

  const { logout } = useContext(UserContext) || {};
  const handleLogout = async () => {
    if (logout) await logout();
    navigate('/login');
  };
  // Determine the home link based on login status and role
  const homeLink = !user ? '/login' : (user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');

  return (
    <nav className="bg-blue-600 h-16 text-white p-4 flex justify-between items-center shadow-md">
      <Link to={homeLink} className="text-xl font-bold hover:text-blue-200 transition-colors"> 
          MediSync
      </Link>

      <div>
        {!user ? ( 
          // --- Logged OUT View ---
          <>
            <Link to="/login" className="mr-4 hover:text-blue-200 transition-colors">Login</Link>
            <Link to="/register" className="hover:text-blue-200 transition-colors">Register</Link>
          </>
        ) : (
          // --- Logged IN View ---
          <>
            {/* Optional: Display welcome message */}
            <span className="mr-4 text-sm">Welcome, {user.name || user.email}!</span> 
            
            {user.role === "patient" && <Link to="/patient-dashboard" className="mr-4 hover:text-blue-200 transition-colors">Dashboard</Link>}
            {user.role === "doctor" && <Link to="/doctor-dashboard" className="mr-4 hover:text-blue-200 transition-colors">Dashboard</Link>}
            {user.role === "patient" && <Link to="/patient/settings" className="mr-4 hover:text-blue-200 transition-colors">Settings</Link>}
            <button 
                onClick={handleLogout} 
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white font-medium transition-colors"
                title="Logout" // Accessibility
            >
                Logout
            </button> 
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
