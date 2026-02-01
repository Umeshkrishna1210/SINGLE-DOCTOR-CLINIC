import React, { useContext, lazy, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";
import { UserContext } from "./context/UserContext";

const PatientDashboard = lazy(() => import("./components/PatientDashboard"));
const DoctorDashboard = lazy(() => import("./components/DoctorDashboard"));
const AppointmentSystem = lazy(() => import("./components/AppointmentSystem"));
const DoctorAllAppointments = lazy(() => import("./components/DoctorAllAppointments"));
const DoctorSettings = lazy(() => import("./components/DoctorSettings"));
const PatientRecordUpload = lazy(() => import("./components/PatientRecordUpload"));
const PatientSettings = lazy(() => import("./components/PatientSettings"));

function App() {
  // Get user data from context
  const { user } = useContext(UserContext) || {};
  // Get current URL location
  const location = useLocation(); 

  // Determine if the sidebar should be displayed
  // Conditions: User must be logged in, role must be 'doctor', and not on login/register pages
  const showSidebar = user && user.role === 'doctor' && 
                      location.pathname !== '/login' && 
                      location.pathname !== '/register';

  // Component to handle default redirection based on login status and role
  const DefaultRoute = () => {
    if (!user) {
      // If not logged in, redirect to login
      return <Navigate to="/login" replace />;
    }
    // If logged in, redirect to the appropriate dashboard
    return user.role === 'doctor' 
      ? <Navigate to="/doctor-dashboard" replace /> 
      : <Navigate to="/patient-dashboard" replace />;
  };

  return (
    // Outermost container: Uses Flexbox column layout, takes full screen height
    <div className="flex flex-col h-screen">
      {/* Navbar always displayed at the top */}
      {/* Ensure Navbar has a defined height, e.g., className="h-16 ..." */}
      <Navbar /> 
      
      {/* Container for content below navbar */}
      {/* Uses Flexbox row layout (default for 'flex'), takes remaining vertical space (flex-1), prevents parent overflow */}
      <div className="flex flex-1 overflow-hidden"> 
        
        {/* Conditionally render the Sidebar */}
        {/* Sidebar should have fixed width (e.g., w-60), full height (h-full), and flex-shrink-0 */}
        {showSidebar && <Sidebar />}

        <main className="flex-grow p-6 overflow-y-auto bg-white dark:bg-gray-900">
          <Suspense fallback={<div className="flex items-center justify-center p-12"><p className="text-gray-500">Loading...</p></div>}>
          <Routes>
            
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient Routes */}
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/book-appointment" element={<AppointmentSystem />} />
            <Route path="/upload-record" element={<PatientRecordUpload />} />
            <Route path="/patient/settings" element={<PatientSettings />} />

            {/* Doctor Routes */}
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/all-appointments" element={<DoctorAllAppointments />} />
            <Route path="/doctor/settings" element={<DoctorSettings />} /> 
            
            {/* Default Route Handler for '/' */}
            <Route path="/" element={<DefaultRoute />} />

          </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;
