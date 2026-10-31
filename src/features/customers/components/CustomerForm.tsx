import { useEffect, useState } from "react";

import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../customerTypes";

interface CustomerFormProps {
  customer?: Customer | null;
  loading: boolean;
  serverError?: string;
  onSubmit: (
    data: CreateCustomerRequest | UpdateCustomerRequest
  ) => void;
  onCancel: () => void;
}

const initialValues = {
  customer_name: "",
  address: "",
  phone_number: "",
  email: "",
  is_active: true,
};

export default function CustomerForm({
  customer,
  loading,
  serverError,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState("");

  useEffect(() => {
    if (customer) {
      setForm({
        customer_name: customer.customer_name,
        address: customer.address,
        phone_number: customer.phone_number,
        email: customer.email,
        is_active: customer.is_active,
      });
    } else {
      setForm(initialValues);
    }

    setError("");
  }, [customer]);

const handleChange = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = event.target;

  setForm((previous) => ({
    ...previous,
    [name]: value,
  }));

  if (name === "phone_number") {
    setError(validatePhoneNumber(value));
  }
};

const validatePhoneNumber = (phone: string): string => {
  const value = phone.trim();

  if (!value) {
    return "Phone number is required.";
  }

  if (!/^[0-9]*$/.test(value)) {
    return "Only numbers are allowed.";
  }

  if (value.length !== 10) {
    return "Phone number must contain exactly 10 digits.";
  }

  return "";
};



 const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setError("");

  if (!form.customer_name.trim()) {
    setError("Customer name is required.");
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

  if (!form.email.trim()) {
    setError("Email is required.");
    return;
  }

  if (customer) {
    const updateData: UpdateCustomerRequest = {
      customer_name: form.customer_name.trim(),
      address: form.address.trim(),
      phone_number: form.phone_number.trim(),
      email: form.email.trim().toLowerCase(),
      is_active: form.is_active,
    };

    onSubmit(updateData);
  } else {
    const createData: CreateCustomerRequest = {
      customer_name: form.customer_name.trim(),
      address: form.address.trim(),
      phone_number: form.phone_number.trim(),
      email: form.email.trim().toLowerCase(),
    };

    onSubmit(createData);
  }
};

  return (
    <form className="customer-form" onSubmit={handleSubmit}>
      <div className="form-head">
        <div>
          <h2>{customer ? "Edit customer" : "Add customer"}</h2>
          <p className="muted">
            {customer
              ? "Update customer information and account status."
              : "Add a new customer to the system."}
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

      <div className="customer-form-grid">
        <div className="field">
          <label htmlFor="customer_name">Customer name</label>
          <input
            id="customer_name"
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            maxLength={150}
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
    placeholder="Enter 10 digit phone number"
    value={form.phone_number}
    onChange={handleChange}
    maxLength={10}
    required
  />
</div>

        <div className="field customer-address-field">
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

        {customer && (
          <div className="field">
            <label htmlFor="is_active">Customer status</label>
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
            : customer
              ? "Update customer"
              : "Create customer"}
        </button>
      </div>
    </form>
  );
}