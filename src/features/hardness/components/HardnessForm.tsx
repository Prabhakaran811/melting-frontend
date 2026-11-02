import { useEffect, useState } from "react";
import type {
  Hardness,
  CreateHardnessRequest,
  UpdateHardnessRequest,
} from "../hardnessTypes";

interface HardnessFormProps {
  hardness?: Hardness | null;
  loading: boolean;
  serverError?: string;
  onSubmit: (data: CreateHardnessRequest | UpdateHardnessRequest) => void;
  onCancel: () => void;
}

export default function HardnessForm({
  hardness,
  loading,
  serverError,
  onSubmit,
  onCancel,
}: HardnessFormProps) {
  const [hardnessName, setHardnessName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setHardnessName(hardness ? hardness.hardness_name : "");
    setError("");
  }, [hardness]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!hardnessName.trim()) {
      setError("Hardness name is required.");
      return;
    }

    onSubmit({ hardness_name: hardnessName.trim() });
  };

  return (
    <form className="hardness-form" onSubmit={handleSubmit}>
      <div className="form-head">
        <div>
          <h2 id="hardness-form-title">
            {hardness ? "Edit hardness" : "Add hardness"}
          </h2>
          <p className="muted">
            {hardness
              ? "Update the name of this hardness type."
              : "Add a new hardness type to the system."}
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
        <label htmlFor="hardness_name">Hardness name</label>
        <input
          id="hardness_name"
          name="hardness_name"
          value={hardnessName}
          onChange={(event) => setHardnessName(event.target.value)}
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
            : hardness
              ? "Update hardness"
              : "Create hardness"}
        </button>
      </div>
    </form>
  );
}