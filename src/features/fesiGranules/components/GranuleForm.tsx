import { useEffect, useState } from "react";
import type {
  Granule,
  CreateGranuleRequest,
  UpdateGranuleRequest,
} from "../granuleTypes";

interface GranuleFormProps {
  granule?: Granule | null;
  loading: boolean;
  serverError?: string;
  onSubmit: (data: CreateGranuleRequest | UpdateGranuleRequest) => void;
  onCancel: () => void;
}

export default function GranuleForm({
  granule,
  loading,
  serverError,
  onSubmit,
  onCancel,
}: GranuleFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(granule ? granule.name : "");
    setError("");
  }, [granule]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("FeSi granule name is required.");
      return;
    }

    onSubmit({ name: name.trim() });
  };

  return (
    <form className="granule-form" onSubmit={handleSubmit}>
      <div className="form-head">
        <div>
          <h2 id="granule-form-title">
            {granule ? "Edit FeSi granule" : "Add FeSi granule"}
          </h2>
          <p className="muted">
            {granule
              ? "Update the name of this FeSi granule."
              : "Add a new FeSi granule to the system."}
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
        <label htmlFor="granule_name">FeSi granule name</label>
        <input
          id="granule_name"
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
            : granule
              ? "Update FeSi granule"
              : "Create FeSi granule"}
        </button>
      </div>
    </form>
  );
}