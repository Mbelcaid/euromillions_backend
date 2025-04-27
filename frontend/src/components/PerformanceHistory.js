import React, { useEffect, useState } from "react";
import { getPerformanceHistory } from "../api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

function PerformanceHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("");
  const [minAcc, setMinAcc] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await getPerformanceHistory(method || undefined, minAcc);
        if (res.data.success) {
          const data = res.data.history.map(item => ({
            ...item,
            accuracy_numbers: item.accuracy_numbers * 100,
            accuracy_stars: item.accuracy_stars * 100
          }));
          setHistory(data);
        } else {
          setError("Erreur récupération historique");
        }
      } catch (e) {
        setError("Erreur connexion backend");
      }
      setLoading(false);
    }
    fetchData();
  }, [method, minAcc]);

  if (loading) return <div>Chargement historique performance...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!history.length) return <div>Aucune donnée historique.</div>;

  return (
    <div style={{ marginTop: 32 }}>
      <h3>Évolution de la performance</h3>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div>
          <label>Méthode :</label>
          <select value={method} onChange={e => setMethod(e.target.value)}>
            <option value="">Toutes</option>
            <option value="markov">Markov</option>
            <option value="frequency">Fréquence</option>
          </select>
        </div>
        <div>
          <label>Exactitude min (%) :</label>
          <input
            type="number"
            min={0}
            max={100}
            value={minAcc * 100}
            onChange={e => setMinAcc(Number(e.target.value) / 100)}
          />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} unit="%" />
          <Tooltip formatter={value => `${value.toFixed(2)}%`} />
          <Legend />
          <Line
            type="monotone"
            dataKey="accuracy_numbers"
            name="Exactitude numéros"
            stroke="#8884d8"
          />
          <Line
            type="monotone"
            dataKey="accuracy_stars"
            name="Exactitude étoiles"
            stroke="#82ca9d"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PerformanceHistory;
