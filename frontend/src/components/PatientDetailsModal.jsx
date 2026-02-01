import React, { useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_BASE } from '../config';

function PatientDetailsModal({ isOpen, onClose, data, isLoading }) {
  const [viewingFile, setViewingFile] = useState(null);
  if (!isOpen) return null;

  const { profile, records } = data || {};
  const token = localStorage.getItem('token');

  const handleViewFile = async (url) => {
    if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) return;
    setViewingFile(url);
    try {
      const res = await axios.get(`${API_BASE}${url}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blobUrl = URL.createObjectURL(res.data);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      alert('Could not open file. Please try again.');
    } finally {
      setViewingFile(null);
    }
  };

  const getFileLinks = (arr) => Array.isArray(arr) ? arr.filter((x) => typeof x === 'string' && x.startsWith('/uploads/')) : []; 

  return (
    <div style={styles.overlay}> {/* Keep existing overlay style */}
      <div style={styles.modal} className="bg-white p-6 rounded-lg shadow-xl relative w-11/12 max-w-2xl max-h-[85vh] overflow-y-auto"> {/* Use Tailwind for modal styling */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl leading-none font-bold focus:outline-none"
          aria-label="Close modal"
        >
          &times; {/* Better close icon */}
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Patient Details</h2>

        {isLoading ? (
          <p className="text-center text-gray-600">Loading patient data...</p>
        ) : (
          <div className="space-y-6"> {/* Add spacing between sections */}
            {/* Profile Section */}
            {profile ? (
              <section className="mb-6 border-b pb-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-700">Profile</h3>
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                {/* Display role if needed */}
                {/* <p><strong>Role:</strong> {profile.role}</p> */}
              </section>
            ) : (
              <p className="text-red-600">Could not load patient profile.</p>
            )}

            {/* Detailed Medical Records Section */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Medical Records History</h3>
              {records && records.length > 0 ? (
                <ul className="space-y-4">
                  {records.map((record) => (
                    <li key={record.id} className="border p-4 rounded bg-gray-50 shadow-sm">
                       <p className="text-xs text-gray-500 mb-2">Recorded on: {dayjs(record.created_at).format('YYYY-MM-DD HH:mm')}</p>
                       <p className="mb-1"><strong>Problem / Reason:</strong></p>
                       <p className="ml-2 text-gray-800 whitespace-pre-wrap">{record.problem || 'N/A'}</p>
                       
                       <p className="mt-2 mb-1"><strong>Previous Medications:</strong></p>
                       <p className="ml-2 text-gray-800 whitespace-pre-wrap">{record.previous_medications || 'N/A'}</p>
                       
                       <p className="mt-2 mb-1"><strong>Medical History:</strong></p>
                       <p className="ml-2 text-gray-800 whitespace-pre-wrap">{record.medical_history || 'N/A'}</p>

                       {/* Display Prescription / Lab Report Files (patient uploads only - string paths) */}
                       {(() => {
                         const prescFiles = getFileLinks(record.prescriptions);
                         const labFiles = getFileLinks(record.lab_reports);
                         if (prescFiles.length === 0 && labFiles.length === 0) return null;
                         return (
                           <div className="mt-3 space-y-2">
                             {prescFiles.length > 0 && (
                               <div>
                                 <strong className="text-sm font-medium">Uploaded Prescriptions:</strong>
                                 <ul className="list-disc list-inside ml-4 mt-1">
                                   {prescFiles.map((url, index) => (
                                     <li key={`rec-${record.id}-presc-${index}`}>
                                       <button
                                         type="button"
                                         onClick={() => handleViewFile(url)}
                                         disabled={viewingFile === url}
                                         className="text-blue-600 hover:underline text-sm text-left"
                                       >
                                         {viewingFile === url ? 'Opening...' : (url.split('/').pop() || `Prescription ${index + 1}`)}
                                       </button>
                                     </li>
                                   ))}
                                 </ul>
                               </div>
                             )}
                             {labFiles.length > 0 && (
                               <div>
                                 <strong className="text-sm font-medium">Uploaded Lab Reports:</strong>
                                 <ul className="list-disc list-inside ml-4 mt-1">
                                   {labFiles.map((url, index) => (
                                     <li key={`rec-${record.id}-lab-${index}`}>
                                       <button
                                         type="button"
                                         onClick={() => handleViewFile(url)}
                                         disabled={viewingFile === url}
                                         className="text-blue-600 hover:underline text-sm text-left"
                                       >
                                         {viewingFile === url ? 'Opening...' : (url.split('/').pop() || `Lab Report ${index + 1}`)}
                                       </button>
                                     </li>
                                   ))}
                                 </ul>
                               </div>
                             )}
                           </div>
                         );
                       })()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No detailed medical records found for this patient.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

// Basic inline styles for the overlay (can be replaced with Tailwind if preferred)
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000, 
  },
   // Modal styles are now primarily handled by Tailwind classes above
  modal: { 
     // Keep basic structure if needed, but Tailwind classes handle appearance
  }
};

export default PatientDetailsModal;
