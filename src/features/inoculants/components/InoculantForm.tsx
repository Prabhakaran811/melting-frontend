import { useEffect, useState } from "react";
import type {
  Inoculant,
  CreateInoculantRequest,
  UpdateInoculantRequest,
} from "../inoculantTypes";

interface InoculantFormProps {
  inoculant?: Inoculant | null;
  loading: boolean;
  serverError?: string;
  onSubmit: (data: CreateInoculantRequest | UpdateInoculantRequest) => void;
  onCancel: () => void;
}

export default function InoculantForm({
  inoculant,
  loading,
  serverError,
  onSubmit,
  onCancel,
}: InoculantFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(inoculant ? inoculant.name : "");
    setError("");
  }, [inoculant]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Inoculant name is required.");
      return;
    }

    onSubmit({ name: name.trim() });
  };

  return (
    <form className="inoculant-form" onSubmit={handleSubmit}>
      <div className="form-head">
        <div>
          <h2 id="inoculant-form-title">
            {inoculant ? "Edit inoculant" : "Add inoculant"}
          </h2>
          <p className="muted">
            {inoculant
              ? "Update the name of this inoculant."
              : "Add a new inoculant to the system."}
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
        <label htmlFor="inoculant_name">Inoculant name</label>
        <input
          id="inoculant_name"
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
            : inoculant
              ? "Update inoculant"
              : "Create inoculant"}
        </button>
      </div>
    </form>
  );
}