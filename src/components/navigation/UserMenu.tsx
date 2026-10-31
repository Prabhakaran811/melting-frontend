import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { clearAuth } from "../../features/auth/authSlice";
import Icon from "../common/Icon";

export default function UserMenu() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    // Replace "token" with the key your app saves the login under
    localStorage.removeItem("token");
    dispatch(clearAuth());
    navigate("/login", { replace: true });
  };

  const name = user?.employee_id ?? "User";

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="avatar" aria-hidden="true">
          {name[0]?.toUpperCase()}
        </span>
        <span className="user-name">{name}</span>
        <Icon name="chevron" size={16} />
      </button>

      {open && (
        <div className="dropdown" role="menu">
          <div className="dropdown-head">
            <p className="dropdown-name">{name}</p>
            <p className="muted">Signed in</p>
          </div>
          <button role="menuitem" className="dropdown-item" onClick={handleLogout}>
            <Icon name="logout" size={16} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}