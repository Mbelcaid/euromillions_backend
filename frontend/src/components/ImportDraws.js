import React, { useState } from "react";
import React, { useState } from "react";
import { importDraws } from "../api";

function ImportDraws({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleImport = async () => {
    setLoading(true);
    setStatus("");
    try {
      await importDraws();
      setStatus("Importation réussie !");
      if (onSuccess) onSuccess();
    } catch (e) {
      setStatus("Erreur lors de l'importation.");
    }
    setLoading(false);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <button onClick={handleImport} disabled={loading}>
        {loading ? "Importation en cours..." : "Importer les tirages EuroMillions"}
      </button>
      {status && <div style={{ marginTop: 8 }}>{status}</div>}
    </div>
  );
}

export default ImportDraws;
