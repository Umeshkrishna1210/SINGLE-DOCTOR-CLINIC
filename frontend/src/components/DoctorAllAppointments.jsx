import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { API_BASE } from '../config';
import { Link } from 'react-router-dom'; // Keep if needed elsewhere, not used in this snippet
import PatientDetailsModal from './PatientDetailsModal';
import AddPrescriptionModal from './AddPrescriptionModal'; // Import the modal component

function DoctorAllAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // State for Patient Details Modal
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [selectedPatientIdForDetails, setSelectedPatientIdForDetails] = useState(null);
  const [patientModalData, setPatientModalData] = useState({ profile: null, records: [] });
  const [isLoadingPatientModal, setIsLoadingPatientModal] = useState(false);

  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedAppointmentForPrescription, setSelectedAppointmentForPrescription] = useState(null);
  const [prescriptionDataForModal, setPrescriptionDataForModal] = useState(null);
  const [patientRecordsForPrescription, setPatientRecordsForPrescription] = useState([]);
  const [isLoadingPrescriptionCheck, setIsLoadingPrescriptionCheck] = useState(false);

  const token = localStorage.getItem("token");

  // Function to fetch all appointments
  const fetchAppointments = useCallback(async () => {
    if (!token) return; setIsLoading(true); setError('');
    try {
      const res = await axios.get(`${API_BASE}/appointments`, { headers: { Authorization: `Bearer ${token}` } });
      const sortedAppointments = res.data.sort((a, b) => dayjs(a.appointment_date).valueOf() - dayjs(b.appointment_date).valueOf());
      setAppointments(sortedAppointments);
    } catch (err) { console.error("Error fetching appointments:", err); setError("Failed to load appointments. Please try again."); }
    finally { setIsLoading(false); }
  }, [token]);

  // Fetch appointments on component mount
  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // Function to handle viewing patient details
  const handleViewPatientDetails = async (patientId) => {
    if (!patientId || !token) { console.error("Patient ID or token missing."); return; } // Added token check
    setSelectedPatientIdForDetails(patientId); setIsPatientModalOpen(true); setIsLoadingPatientModal(true); setPatientModalData({ profile: null, records: [] });
    try {
      const response = await axios.get(`${API_BASE}/patient/profile-and-records/${patientId}`, { headers: { Authorization: `Bearer ${token}` } });
      setPatientModalData({ profile: response.data.profile, records: response.data.records });
    } catch (err) { console.error("Error fetching patient details or records for modal:", err); setPatientModalData({ profile: null, records: [] }); alert(err.response?.data?.message || "Could not load patient details."); }
    finally { setIsLoadingPatientModal(false); }
  };

  // Function to close the patient details modal
  const closePatientModal = () => {
    setIsPatientModalOpen(false); setSelectedPatientIdForDetails(null);
  };


  // --- UPDATED: Prescription Handling ---

  const handleOpenPrescriptionModal = async (appointment) => {
    if (!appointment || !token) return;

    setIsLoadingPrescriptionCheck(true);
    setSelectedAppointmentForPrescription({
        id: appointment.id,
        patient_id: appointment.patient_id,
        patientName: appointment.patientName,
        appointment_date: appointment.appointment_date
    });
    setPrescriptionDataForModal(null);
    setPatientRecordsForPrescription([]);

    try {
      const [prescRes, recordsRes] = await Promise.all([
        axios.get(`${API_BASE}/medical-records/for-patient/${appointment.patient_id}`, { headers: { Authorization: `Bearer ${token}` } }).catch(e => ({ response: { status: 404 } })),
        axios.get(`${API_BASE}/patient/profile-and-records/${appointment.patient_id}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { records: [] } }))
      ]);
      setPrescriptionDataForModal(prescRes.response?.status === 404 ? null : prescRes.data);
      setPatientRecordsForPrescription(recordsRes.data?.records || []);
    } catch (err) {
      setPrescriptionDataForModal(null);
      setPatientRecordsForPrescription([]);
      alert("Could not load prescription data. Please try again.");
    } finally {
      setIsLoadingPrescriptionCheck(false);
      setIsPrescriptionModalOpen(true);
    }
  };


  const closePrescriptionModal = () => {
      setIsPrescriptionModalOpen(false);
      setSelectedAppointmentForPrescription(null);
      setPrescriptionDataForModal(null);
      setPatientRecordsForPrescription([]);
  };

  // Handler to save prescription (Calls Backend POST endpoint)
  const handleSavePrescription = async (prescriptionData) => {
      console.log("Attempting to save prescription:", prescriptionData);
      if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
      }
      try {
          const response = await axios.post(
              `${API_BASE}/medical-records/prescription`,
              prescriptionData, // contains { patientId, appointmentId, diagnosis, medicationList }
              {
                  headers: { Authorization: `Bearer ${token}` }
              }
          );

          console.log("Prescription saved/updated successfully via backend:", response.data);
          alert(response.data.message || "Prescription saved!");

          // Update appointment status locally in the full list
          setAppointments(prev => prev.map(appt =>
              appt.id === prescriptionData.appointmentId
                  ? { ...appt, status: 'completed' } // Update status
                  : appt
          ));
          closePrescriptionModal(); // Close modal on success

      } catch (error) {
          console.error("Error saving prescription:", error);
          throw new Error(error.response?.data?.error || "Failed to save prescription. Please try again.");
      }
  };
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = !searchTerm || (apt.patientName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">All Appointments</h2>

      {error && <p className="text-red-600 bg-red-100 p-3 rounded mb-4">{error}</p>}

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search by patient name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-center mt-10">Loading appointments...</p>
      ) : filteredAppointments.length > 0 ? (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <ul className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <li
                key={appointment.id}
                className="border rounded p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
              >
                {/* Appointment Details */}
                <div className="flex-grow">
                  <p className="font-semibold">
                    Patient:
                    <button
                      onClick={() => handleViewPatientDetails(appointment.patient_id)}
                      className="text-blue-600 hover:underline ml-2 focus:outline-none"
                      title="View Patient Details"
                    >
                      {appointment.patientName}
                    </button>
                  </p>
                  <p className="text-sm text-gray-700">
                    Date: {dayjs(appointment.appointment_date).format("ddd, MMM D, YYYY - h:mm A")}
                  </p>
                  <p className="text-sm text-gray-700">
                    Status:
                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded ${
                      appointment.status === 'completed' ? 'bg-gray-200 text-gray-700' :
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </p>
                </div>
                {/* Add/Update/Edit Prescription Button */}
                <div className="flex-shrink-0 flex mt-2 sm:mt-0">
                  <button
                    onClick={() => handleOpenPrescriptionModal(appointment)}
                    className={`px-3 py-1 rounded text-sm font-medium disabled:opacity-50 ${
                      appointment.status === 'completed'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                    title={appointment.status === 'completed' ? 'Edit prescription (correct mistakes)' : 'Add or Update Prescription'}
                    disabled={isLoadingPrescriptionCheck}
                  >
                    {isLoadingPrescriptionCheck ? 'Loading...' : (appointment.status === 'completed' ? 'Edit Prescription' : 'Add/Update Prescription')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500 italic text-center mt-10">
          {appointments.length > 0 ? "No appointments match your filters." : "No appointments found."}
        </p>
      )}

      {/* Render Patient Details Modal */}
      <PatientDetailsModal
        isOpen={isPatientModalOpen}
        onClose={closePatientModal}
        data={patientModalData}
        isLoading={isLoadingPatientModal}
      />

       {/* Render Add Prescription Modal */}
      <AddPrescriptionModal
          isOpen={isPrescriptionModalOpen}
          onClose={closePrescriptionModal}
          appointmentInfo={selectedAppointmentForPrescription}
          onSave={handleSavePrescription}
          existingData={prescriptionDataForModal}
          patientRecords={patientRecordsForPrescription}
      />

    </div>
  );
}

export default DoctorAllAppointments;