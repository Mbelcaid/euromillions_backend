import React, { useEffect, useState } from "react";
import { getGaps } from "../api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

function GapsDashboard() {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await getGaps();
        if (res.data.success) {
          const data = res.data.gaps
            .filter(item => item.avg_gap !== null)
            .map(item => ({ ...item, avg_gap: Number(item.avg_gap) }));
          setGaps(data);
        } else {
          setError(res.data.error || "Erreur récupération des écarts");
        }
      } catch (e) {
        setError(e.message || "Erreur connexion backend");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div>Chargement des écarts...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ marginTop: 32 }}>
      <h3>Écart moyen entre apparitions</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={gaps} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="number" label={{ value: "Numéro", position: "insideBottom", offset: -5 }} />
          <YAxis label={{ value: "Tirs en moyenne", angle: -90, position: "insideLeft" }} />
          <Tooltip formatter={value => value.toFixed(1)} labelFormatter={label => `Numéro ${label}`} />
          <Bar dataKey="avg_gap" name="Écart moyen" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GapsDashboard;
