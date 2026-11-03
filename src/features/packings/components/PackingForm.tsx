import { useEffect, useState } from "react";
import type {
  Packing,
  CreatePackingRequest,
  UpdatePackingRequest,
} from "../packingTypes";

interface PackingFormProps {
  packing?: Packing | null;
  loading: boolean;
  serverError?: string;
  onSubmit: (data: CreatePackingRequest | UpdatePackingRequest) => void;
  onCancel: () => void;
}

export default function PackingForm({
  packing,
  loading,
  serverError,
  onSubmit,
  onCancel,
}: PackingFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(packing ? packing.name : "");
    setError("");
  }, [packing]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Packing name is required.");
      return;
    }

    onSubmit({ name: name.trim() });
  };

  return (
    <form className="packing-form" onSubmit={handleSubmit}>
      <div className="form-head">
        <div>
          <h2 id="packing-form-title">
            {packing ? "Edit packing" : "Add packing"}
          </h2>
          <p className="muted">
            {packing
              ? "Update the name of this packing type."
              : "Add a new packing type to the system."}
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

      <div className="field">
        <label htmlFor="packing_name">Packing name</label>
        <input
          id="packing_name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={150}
          required
          autoFocus
        />
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
            : packing
              ? "Update packing"
              : "Create packing"}
        </button>
      </div>
    </form>
  );
}