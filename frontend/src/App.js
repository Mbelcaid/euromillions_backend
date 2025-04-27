import React, { useState, useEffect } from "react";
import MethodSelector from "./components/MethodSelector";
import PredictionResult from "./components/PredictionResult";
import StatsDashboard from "./components/StatsDashboard";
import PerformanceDashboard from "./components/PerformanceDashboard";
import PerformanceHistory from "./components/PerformanceHistory";
import GapsDashboard from "./components/GapsDashboard";
import { predictMarkov, predictFrequency, getPerformance, getGaps } from "./api";

function App() {
  // Import automatique géré par la tâche cron, pas d'étape manuelle initiale
  const [step, setStep] = useState(2);
  const [method, setMethod] = useState("regression");
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(2);
  const [numPredictions, setNumPredictions] = useState(5);

  const handleGenerate = async () => {
    setLoadingPrediction(true);
    setError("");
    setPrediction(null);
    if (method === "markov") {
      const actualOrder = order < 1 ? 1 : order;
      try {
        const response = await predictMarkov(actualOrder, numPredictions);
        if (response.data.success) {
          // Calculer l'intervalle de confiance bootstrap
          const data = response.data;
          let confStr = "";
          if (data.confidence.numbers) {
            const lowers = data.confidence.numbers.map(c => c.lower);
            const uppers = data.confidence.numbers.map(c => c.upper);
            const minL = Math.min(...lowers) * 100;
            const maxU = Math.max(...uppers) * 100;
            confStr = `[${minL.toFixed(2)}% - ${maxU.toFixed(2)}%]`;
          } else {
            confStr = `[${(data.confidence.lower*100).toFixed(2)}% - ${(data.confidence.upper*100).toFixed(2)}%]`;
          }
          setPrediction({
            numbers: data.predictions[0]?.numbers,
            stars: data.predictions[0]?.stars,
            confidence: confStr,
            method: data.method
          });
        } else {
          setError(response.data.error || "Erreur lors de la génération.");
        }
      } catch (e) {
        setError("Erreur de connexion au backend.");
      }
      setLoadingPrediction(false);
      setStep(3);
      return;
    }
    else if (method === "freq") {
      try {
        const response = await predictFrequency(numPredictions);
        if (response.data.success) {
          setPrediction({
            numbers: response.data.predictions[0]?.numbers,
            stars: response.data.predictions[0]?.stars,
            method: response.data.method,
            confidence: ""
          });
        } else {
          setError(response.data.error || "Erreur lors de la génération.");
        }
      } catch (e) {
        setError("Erreur de connexion au backend.");
      }
      setLoadingPrediction(false);
      setStep(3);
      return;
    }
    // Simule pour les autres méthodes
    setTimeout(() => {
      setPrediction({
        numbers: ["3", "17", "22", "35", "44"],
        stars: ["5", "10"],
        confidence: "[70% - 85%]",
        method: method === "regression" ? "Régression" : "Fréquence simple"
      });
      setLoadingPrediction(false);
      setStep(3);
    }, 1000);
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Analyse prédictive EuroMillions</h2>
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ flex: 1 }}><StatsDashboard /></div>
        <div style={{ marginLeft: 16, flex: 1, fontStyle: "italic", color: "#555" }}>
          Affiche la fréquence d’apparition des numéros et étoiles, identifie les numéros chauds et froids.
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ flex: 1 }}><PerformanceDashboard /></div>
        <div style={{ marginLeft: 16, flex: 1, fontStyle: "italic", color: "#555" }}>
          Présente le taux de succès global de vos prédictions selon la méthode choisie.
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ flex: 1 }}><PerformanceHistory /></div>
        <div style={{ marginLeft: 16, flex: 1, fontStyle: "italic", color: "#555" }}>
          Visualise l’évolution de l’exactitude des prédictions dans le temps.
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ flex: 1 }}><GapsDashboard /></div>
        <div style={{ marginLeft: 16, flex: 1, fontStyle: "italic", color: "#555" }}>
          Affiche l’écart moyen (en nombre de tirages) entre deux apparitions d’un même numéro.
        </div>
      </div>
      {step === 2 && (
        <>
          <MethodSelector selected={method} onChange={setMethod} />
          {method === "markov" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label>Ordre de la chaîne de Markov : </label>
                <input type="number" min={1} max={5} value={order} onChange={e => setOrder(Number(e.target.value))} />
                <div style={{ fontSize: '0.9em', color: '#555', fontStyle: 'italic', marginTop: 4 }}>
                  Détermine la profondeur du modèle (max 5): plus élevé = plus de contexte historique pris en compte.
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Nombre de prédictions : </label>
                <input type="number" min={1} max={1000} value={numPredictions} onChange={e => setNumPredictions(Number(e.target.value))} />
                <div style={{ fontSize: '0.9em', color: '#555', fontStyle: 'italic', marginTop: 4 }}>
                  Nombre de combinaisons générées à chaque exécution.
                </div>
              </div>
            </>
          )}
          <button onClick={handleGenerate} disabled={loadingPrediction}>
            {loadingPrediction ? "Génération..." : "Générer la combinaison"}
          </button>
          {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
        </>
      )}
      {step === 3 && (
        <PredictionResult result={prediction} onRegenerate={() => setStep(2)} />
      )}
    </div>
  );
}

export default App;