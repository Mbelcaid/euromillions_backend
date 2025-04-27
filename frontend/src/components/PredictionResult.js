import React from "react";

function PredictionResult({ result, onRegenerate }) {
  if (!result) return null;

  return (
    <div style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
      <h3>Proposition pour le prochain tirage</h3>
      <div>
        <strong>Numéros :</strong> {result.numbers && result.numbers.join(", ")}
      </div>
      <div>
        <strong>Étoiles :</strong> {result.stars && result.stars.join(", ")}
      </div>
      <div>
        <strong>Intervalle de confiance :</strong> {result.confidence}
      </div>
      <div>
        <strong>Méthode :</strong> {result.method}
      </div>
      <button onClick={onRegenerate} style={{ marginTop: 16 }}>
        Nouvelle génération
      </button>
    </div>
  );
}

export default PredictionResult;
