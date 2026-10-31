import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { loginUser } from "../features/auth/authThunks";

import "./login.css";

// Rising embers (fixed values, so the layout is the same on every render)
const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  left: 38 + ((i * 37) % 26),
  size: 2 + (i % 4),
  duration: 4 + (i % 5),
  delay: (i * 0.7) % 6,
  drift: ((i % 7) - 3) * 14,
}));

// Induction coil rings around the furnace body
const COILS = [130, 162, 194, 226, 258].map((y) => ({
  y,
  left: 62 + (y - 96) * 0.111,
}));

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector((state) => state.auth);

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");

  // Demo readings – replace with real IIoT data later
  const [temp, setTemp] = useState(1482);
  const [power, setPower] = useState(640);

  const furnaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTemp(1482 + Math.round((Math.random() - 0.5) * 12));
      setPower(640 + Math.round((Math.random() - 0.5) * 16));
    }, 1400);
    return () => window.clearInterval(id);
  }, []);

  // Tilt the furnace toward the mouse
  const handleMove = (event: MouseEvent<HTMLElement>) => {
    const el = furnaceRef.current;
    if (!el) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 12).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 18).toFixed(2)}deg`);
  };

  const handleLeave = () => {
    const el = furnaceRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = await dispatch(
      loginUser({
        employee_id: employeeId.trim(),
        password,
      })
    );

    if (loginUser.fulfilled.match(result)) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <main className="login">
      <section
        className="login-brand"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <div className="logo">Melting</div>

        <div className="stage" aria-hidden="true">
          <div className="floor" />

          <div className="furnace" ref={furnaceRef}>
            <svg
              className="furnace-svg"
              viewBox="0 0 320 320"
              role="img"
              aria-label="Induction melting furnace with glowing molten metal"
            >
              <defs>
                <linearGradient id="shell" x1="0" x2="1">
                  <stop offset="0" stopColor="#2b333d" />
                  <stop offset="0.5" stopColor="#3b4652" />
                  <stop offset="1" stopColor="#1b2128" />
                </linearGradient>
                <radialGradient id="melt" cx="0.5" cy="0.5" r="0.6">
                  <stop offset="0" stopColor="#fff3c4" />
                  <stop offset="0.35" stopColor="#ffb347" />
                  <stop offset="0.75" stopColor="#e8590c" />
                  <stop offset="1" stopColor="#8a2a05" />
                </radialGradient>
                <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#ff8a3d" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#ff8a3d" stopOpacity="0" />
                </radialGradient>
                <clipPath id="meltClip">
                  <ellipse cx="160" cy="96" rx="88" ry="20" />
                </clipPath>
              </defs>

              <ellipse cx="160" cy="92" rx="170" ry="90" fill="url(#halo)" />
              <ellipse cx="160" cy="296" rx="112" ry="16" fill="#000" opacity="0.35" />

              {/* Furnace body */}
              <path d="M62 96 L82 276 Q160 304 238 276 L258 96 Z" fill="url(#shell)" />

              {/* Induction coil rings */}
              {COILS.map((c, i) => (
                <path
                  key={c.y}
                  className="coil"
                  d={`M${c.left} ${c.y} Q160 ${c.y + 26} ${320 - c.left} ${c.y}`}
                  style={{ animationDelay: `${i * 0.25}s` }}
                />
              ))}

              {/* Rim and molten metal */}
              <ellipse cx="160" cy="96" rx="100" ry="24" fill="#3d4854" stroke="#566471" strokeWidth="2" />
              <ellipse cx="160" cy="96" rx="88" ry="20" fill="url(#melt)" />
              <ellipse className="melt-glow" cx="160" cy="96" rx="88" ry="20" fill="#ffd9a0" />

              <g clipPath="url(#meltClip)">
                <circle className="bubble" cx="130" cy="98" r="5" fill="#fff3c4" style={{ animationDelay: "0s" }} />
                <circle className="bubble" cx="178" cy="94" r="4" fill="#fff3c4" style={{ animationDelay: "0.9s" }} />
                <circle className="bubble" cx="152" cy="102" r="3" fill="#fff3c4" style={{ animationDelay: "1.7s" }} />
                <ellipse className="ripple" cx="160" cy="96" rx="10" ry="3" style={{ animationDelay: "0s" }} />
                <ellipse className="ripple" cx="160" cy="96" rx="10" ry="3" style={{ animationDelay: "1.5s" }} />
              </g>
            </svg>

            <div className="chip chip-temp">
              <p className="chip-label">
                <span className="live-dot" /> Melt temperature
              </p>
              <p className="chip-value">{temp.toLocaleString("en-US")} °C</p>
            </div>

            <div className="chip chip-power">
              <p className="chip-label">Furnace power</p>
              <p className="chip-value">{power} kW</p>
            </div>

            <div className="chip chip-cycle">
              <p className="chip-label">Heat M-1042</p>
              <div className="meter">
                <span />
              </div>
            </div>
          </div>

          {EMBERS.map((e, i) => (
            <span
              key={i}
              className="ember"
              style={
                {
                  left: `${e.left}%`,
                  width: e.size,
                  height: e.size,
                  "--t": `${e.duration}s`,
                  "--d": `${e.delay}s`,
                  "--drift": `${e.drift}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div>
          <p className="login-tagline">Every melt, tracked from charge to pour.</p>
          <ul className="login-points">
          
          </ul>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Sign in</h1>
          <p className="muted">Use your employee credentials to open the dashboard.</p>

          <label htmlFor="employeeId">Employee ID</label>
          <input
            id="employeeId"
            type="text"
            autoComplete="username"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            required
            autoFocus
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="login-status">
          <span className="live-dot" /> Plant network online
        </p>
      </section>
    </main>
  );
}