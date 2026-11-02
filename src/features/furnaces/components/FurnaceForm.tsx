import { useEffect, useState } from "react";
import type {
  Furnace,
  CreateFurnaceRequest,
  UpdateFurnaceRequest,
} from "../furnaceTypes";

interface FurnaceFormProps {
  furnace?: Furnace | null;
  loading: boolean;
  serverError?: string;
  onSubmit: (data: CreateFurnaceRequest | UpdateFurnaceRequest) => void;
  onCancel: () => void;
}

const initialValues = {
  name: "",
  furnace_no: "",
  ref_no: "",
  capacity: "",
};

export default function FurnaceForm({
  furnace,
  loading,
  serverError,
  onSubmit,
  onCancel,
}: FurnaceFormProps) {
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState("");

  useEffect(() => {
    if (furnace) {
      setForm({
        name: furnace.name,
        furnace_no: furnace.furnace_no,
        ref_no: furnace.ref_no,
        capacity: String(Number(furnace.capacity)),
      });
    } else {
      setForm(initialValues);
    }

    setError("");
  }, [furnace]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Furnace name is required.");
      return;
    }

    if (!form.furnace_no.trim()) {
      setError("Furnace number is required.");
      return;
    }

    if (!form.ref_no.trim()) {
      setError("Reference number is required.");
      return;
    }

    const capacity = Number(form.capacity);

    if (!form.capacity || Number.isNaN(capacity) || capacity <= 0) {
      setError("Capacity must be a number greater than zero.");
      return;
    }

    onSubmit({
      name: form.name.trim(),
      furnace_no: form.furnace_no.trim(),
      ref_no: form.ref_no.trim(),
      capacity,
    });
  };

  return (
    <form className="furnace-form" onSubmit={handleSubmit}>
      <div className="form-head">
        <div>
          <h2 id="furnace-form-title">
            {furnace ? "Edit furnace" : "Add furnace"}
          </h2>
          <p className="muted">
            {furnace
              ? "Update the details of this furnace."
              : "Register a new furnace in the plant."}
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

      <div className="furnace-form-grid">
        <div className="field furnace-wide-field">
          <label htmlFor="furnace_name">Furnace name</label>
          <input
            id="furnace_name"
            name="name"
            value={form.name}
            onChange={handleChange}
            maxLength={150}
            required
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="furnace_no">Furnace number</label>
          <input
            id="furnace_no"
            name="furnace_no"
            value={form.furnace_no}
            onChange={handleChange}
            maxLength={50}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="ref_no">Reference number</label>
          <input
            id="ref_no"
            name="ref_no"
            value={form.ref_no}
            onChange={handleChange}
            maxLength={50}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="capacity">Capacity</label>
          <input
            id="capacity"
            type="number"
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            inputMode="decimal"
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
            : furnace
              ? "Update furnace"
              : "Create furnace"}
        </button>
      </div>
    </form>
  );
}