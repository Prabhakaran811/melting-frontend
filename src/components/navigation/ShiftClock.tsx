import { useEffect, useState } from "react";

// Shift hours are an assumption: A 06-14, B 14-22, C 22-06. Change to match your plant.
const shiftFor = (date: Date) => {
  const hour = date.getHours();
  if (hour >= 6 && hour < 14) return "A";
  if (hour >= 14 && hour < 22) return "B";
  return "C";
};

export default function ShiftClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="shift-chip" title="Current shift and local time">
      <span className="status-dot" />
      <strong>Shift {shiftFor(now)}</strong>
      <span className="shift-time">
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}