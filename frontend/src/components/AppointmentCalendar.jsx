import React, { useState } from "react";
import dayjs from "dayjs";

function AppointmentCalendar({ appointments = [], onDateSelect, onAppointmentClick }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const startDate = startOfMonth.startOf("week");
  const endDate = endOfMonth.endOf("week");
  const days = [];
  let day = startDate;

  while (day.isBefore(endDate) || day.isSame(endDate, "day")) {
    days.push(day);
    day = day.add(1, "day");
  }

  const getAppointmentsForDay = (d) =>
    appointments.filter((a) => dayjs(a.appointment_date).isSame(d, "day"));

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <button
          type="button"
          onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Previous month"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {currentMonth.format("MMMM YYYY")}
        </h3>
        <button
          type="button"
          onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Next month"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">
        {weekDays.map((wd) => (
          <div key={wd} className="py-2">
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const dayAppointments = getAppointmentsForDay(d);
          const isCurrentMonth = d.month() === currentMonth.month();
          const isToday = d.isSame(dayjs(), "day");
          return (
            <div
              key={d.format("YYYY-MM-DD")}
              className={`min-h-[80px] p-2 border-b border-r dark:border-gray-700
                ${!isCurrentMonth ? "bg-gray-50 dark:bg-gray-900/50 text-gray-400" : ""}
                ${isToday ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
            >
              <div
                className={`text-sm font-medium mb-1 ${!isCurrentMonth ? "text-gray-400" : ""}`}
              >
                {d.date()}
              </div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 2).map((apt) => (
                  <button
                    key={apt.id}
                    type="button"
                    onClick={() => onAppointmentClick?.(apt)}
                    className="block w-full text-left text-xs truncate px-1 py-0.5 rounded
                      bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/60"
                  >
                    {dayjs(apt.appointment_date).format("h:mm A")}
                    {apt.patientName ? ` - ${apt.patientName}` : ""}
                  </button>
                ))}
                {dayAppointments.length > 2 && (
                  <span className="text-xs text-gray-500">+{dayAppointments.length - 2} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AppointmentCalendar;
