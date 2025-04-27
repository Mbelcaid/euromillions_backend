import React, { useState, useEffect } from "react";
import { getPerformance } from "../api";

function PerformanceDashboard() {
  const [perf, setPerf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPerf() {
      setLoading(true);
      setError("");
      try {
        const res = await getPerformance();
        setPerf(res.data);
      } catch (e) {
        setError("Erreur lors de la récupération des performances.");
      }
      setLoading(false);
    }
    fetchPerf();
  }, []);

  if (loading) return <div>Chargement des performances...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!perf?.success) return <div>{perf?.error || "Pas de performances disponibles."}</div>;

  const { total_predictions, evaluated, accuracy } = perf;
  return (
    <div style={{ marginBottom: 24 }}>
      <h3>Performance du modèle</h3>
      <p>Total prédictions: {total_predictions}</p>
      <p>Évaluées: {evaluated}</p>
      <p>Exactitude numéros: {(accuracy.numbers * 100).toFixed(2)}%</p>
      <p>Exactitude étoiles: {(accuracy.stars * 100).toFixed(2)}%</p>
    </div>
  );
}

export default PerformanceDashboard;
