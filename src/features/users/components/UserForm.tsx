import { useEffect, useState } from "react";
import type {
  User,
  UserRole,
  CreateUserRequest,
  UpdateUserRequest,
} from "../userTypes";

interface UserFormProps {
  user?: User | null;
  loading: boolean;
  serverError?: string;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
  onCancel: () => void;
}

const initialValues = {
  employee_id: "",
  full_name: "",
  email: "",
  phone_number: "",
  password: "",
  role: "operator" as UserRole,
  is_active: true,
};

export default function UserForm({
  user,
  loading,
  onSubmit,
  serverError,
  onCancel,
}: UserFormProps) {
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        employee_id: user.employee_id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        password: "",
        role: user.role,
        is_active: user.is_active,
      });
    } else {
      setForm(initialValues);
    }

    setError("");
  }, [user]);

const handleChange = (
  event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name } = event.target;
  let { value } = event.target;

  if (name === "phone_number") {
    value = value.replace(/\D/g, "").slice(0, 10);
  }

  setForm((previous) => ({
    ...previous,
    [name]: value,
  }));

  setError("");
};

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.full_name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!user && !form.password) {
      setError("Password is required for a new employee.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone_number)) {
  setError("Phone number must contain exactly 10 digits.");
  return;
}

    if (user) {
      const updateData: UpdateUserRequest = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone_number: form.phone_number.trim(),
        role: form.role,
        is_active: form.is_active,
      };

      onSubmit(updateData);
    } else {
      const createData: CreateUserRequest = {
        employee_id: form.employee_id.trim(),
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone_number: form.phone_number.trim(),
        password: form.password,
        role: form.role,
      };

      onSubmit(createData);
    }
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="form-head">
        <div>
          <h2>{user ? "Edit employee" : "Add employee"}</h2>
          <p className="muted">
            {user
              ? "Update the details and access for this account."
              : "Create a new account for plant staff."}
          </p>
        </div>

        <button
          type="button"
          className="form-close"
          onClick={onCancel}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="employee_id">Employee ID</label>
          <input
            id="employee_id"
            name="employee_id"
            value={form.employee_id}
            onChange={handleChange}
            disabled={Boolean(user)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="full_name">Full name</label>
          <input
            id="full_name"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

<div className="field">
  <label htmlFor="phone_number">Phone number</label>

  <input
    id="phone_number"
    type="tel"
    name="phone_number"
    inputMode="numeric"
    autoComplete="tel"
    placeholder="Enter 10 digit phone number"
    value={form.phone_number}
    onChange={handleChange}
    maxLength={10}
    required
  />

  <small>Enter exactly 10 digits.</small>
</div>

        {!user && (
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
              required
            />
            <small>Minimum 12 characters.</small>
          </div>
        )}

        <div className="field">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
            <option value="operator">Operator</option>
            <option value="inspector">Inspector</option>
          </select>
        </div>

        {user && (
          <div className="field">
            <label htmlFor="is_active">Account status</label>
            <select
              id="is_active"
              value={String(form.is_active)}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  is_active: event.target.value === "true",
                }))
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        )}
      </div>

     {(error || serverError) && (
  <p className="form-error" role="alert">
    {error || serverError}
  </p>
)}

      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : user
              ? "Update employee"
              : "Create employee"}
        </button>
      </div>
    </form>
  );
}