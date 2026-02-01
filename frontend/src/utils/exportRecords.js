import { jsPDF } from "jspdf";
import dayjs from "dayjs";

export function exportRecordsToCSV(records, userName = "Patient") {
  const headers = ["Date", "Problem", "Previous Medications", "Medical History", "Prescriptions", "Lab Reports"];
  const rows = records.map((r) => [
    dayjs(r.created_at).format("YYYY-MM-DD HH:mm"),
    (r.problem || "").replace(/"/g, '""'),
    (r.previous_medications || "").replace(/"/g, '""'),
    (r.medical_history || "").replace(/"/g, '""'),
    Array.isArray(r.prescriptions) ? r.prescriptions.join("; ") : "",
    Array.isArray(r.lab_reports) ? r.lab_reports.join("; ") : "",
  ]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((c) => `"${c}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `medical-records-${userName}-${dayjs().format("YYYY-MM-DD")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportRecordsToPDF(records, userName = "Patient") {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.text("Medical Records - " + userName, 20, y);
  y += 10;
  doc.setFontSize(10);
  doc.text("Exported on " + dayjs().format("MMMM D, YYYY"), 20, y);
  y += 15;

  records.forEach((r, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.text(`Record ${i + 1} - ${dayjs(r.created_at).format("YYYY-MM-DD")}`, 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.text("Problem: " + (r.problem || "N/A"), 20, y);
    y += 6;
    doc.text("Previous Medications: " + (r.previous_medications || "N/A").substring(0, 150), 20, y);
    y += 6;
    doc.text("Medical History: " + (r.medical_history || "N/A").substring(0, 150), 20, y);
    y += 10;
  });

  doc.save(`medical-records-${userName}-${dayjs().format("YYYY-MM-DD")}.pdf`);
}
