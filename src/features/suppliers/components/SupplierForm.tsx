import { useEffect, useState } from "react";

import type { Supplier, CreateSupplierRequest } from "../supplierTypes";

interface SupplierFormProps {
  supplier?: Supplier | null;
  loading: boolean;
  serverError?: string;
  onSubmit: (data: CreateSupplierRequest) => void;
  onCancel: () => void;
}

const initialValues: CreateSupplierRequest = {
  name: "",
  address: "",
  phone_number: "",
};

const validatePhoneNumber = (phone: string): string => {
  const value = phone.trim();

  if (!value) return "Phone number is required.";
  if (!/^[0-9]*$/.test(value)) return "Only numbers are allowed.";
  if (value.length !== 10) return "Phone number must contain exactly 10 digits.";

  return "";
};

export default function SupplierForm({
  supplier,
  loading,
  serverError,
  onSubmit,
  onCancel,
}: SupplierFormProps) {
  const [form, setForm] = useState<CreateSupplierRequest>(initialValues);
  const [error, setError] = useState("");

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name,
        address: supplier.address,
        phone_number: supplier.phone_number,
      });
    } else {
      setForm(initialValues);
    }

    setError("");
  }, [supplier]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));

    if (name === "phone_number") {
      setError(validatePhoneNumber(value));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Supplier name is required.");
      return;
    }

    if (!form.address.trim()) {
      setError("Address is required.");
      return;
    }

    const phoneError = validatePhoneNumber(form.phone_number);

    if (phoneError) {
      setError(phoneError);
      return;
    }

    onSubmit({
      name: form.name.trim(),
      address: form.address.trim(),
      phone_number: form.phone_number.trim(),
    });
  };

  return (
    <form className="supplier-form" onSubmit={handleSubmit}>
      <div className="form-head">
        <div>
          <h2>{supplier ? "Edit supplier" : "Add supplier"}</h2>
          <p className="muted">
            {supplier
              ? "Update supplier information."
              : "Add a new supplier to the system."}
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

      <div className="supplier-form-grid">
        <div className="field">
          <label htmlFor="name">Supplier name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            maxLength={150}
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
            placeholder="Enter 10 digit phone number"
            value={form.phone_number}
            onChange={handleChange}
            maxLength={10}
            required
          />
        </div>

        <div className="field supplier-address-field">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>
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
            : supplier
              ? "Update supplier"
              : "Create supplier"}
        </button>
      </div>
    </form>
  );
}