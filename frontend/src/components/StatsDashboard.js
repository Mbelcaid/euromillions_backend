import React, { useState, useEffect } from "react";
import { getFrequencies } from "../api";

function StatsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError("");
      try {
        const res = await getFrequencies();
        setStats(res.data);
      } catch (e) {
        setError("Erreur lors de la récupération des statistiques.");
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return <div>Chargement des statistiques...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!stats) return null;

  return (
    <div style={{ marginTop: 32 }}>
      <h3>Fréquence des numéros (top 10)</h3>
      <table style={{ width: "100%", marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Apparitions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(stats.numbers_frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([num, freq]) => (
              <tr key={num}>
                <td>{num}</td>
                <td>
                  <div style={{ background: "#e0e0e0", width: "100%", height: 10 }}>
                    <div style={{ background: "#2196f3", width: `${freq}px`, height: 10 }} />
                  </div>
                  <span>{freq}</span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <h3>Fréquence des étoiles (top 5)</h3>
      <table style={{ width: "100%", marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Étoile</th>
            <th>Apparitions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(stats.stars_frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([star, freq]) => (
              <tr key={star}>
                <td>{star}</td>
                <td>
                  <div style={{ background: "#e0e0e0", width: "100%", height: 10 }}>
                    <div style={{ background: "#ff9800", width: `${freq * 2}px`, height: 10 }} />
                  </div>
                  <span>{freq}</span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 48 }}>
        <div>
          <h4>Numéros chauds</h4>
          <ul>{stats.hot_numbers.map(n => <li key={n}>{n}</li>)}</ul>
          <h4>Numéros froids</h4>
          <ul>{stats.cold_numbers.map(n => <li key={n}>{n}</li>)}</ul>
        </div>
        <div>
          <h4>Étoiles chaudes</h4>
          <ul>{stats.hot_stars.map(s => <li key={s}>{s}</li>)}</ul>
          <h4>Étoiles froides</h4>
          <ul>{stats.cold_stars.map(s => <li key={s}>{s}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

export default StatsDashboard;