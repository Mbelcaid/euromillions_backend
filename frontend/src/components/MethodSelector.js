import React from "react";

function MethodSelector({ selected, onChange }) {
  const descriptions = {
    regression: 'Méthode de régression linéaire pour prédire les numéros en fonction des tendances historiques.',
    markov: 'Chaîne de Markov de second ordre pour modéliser les transitions entre tirages consecutifs.',
    freq: 'Analyse de la fréquence des numéros et étoiles sur l’historique complet des tirages.'
  };
  return (
    <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <label>Choisissez la méthode de génération :</label>
        <select value={selected} onChange={e => onChange(e.target.value)}>
          <option value="regression">Régression</option>
          <option value="markov">Chaîne de Markov</option>
          <option value="freq">Fréquence simple</option>
          {/* Ajouter d'autres méthodes ici au besoin */}
        </select>
      </div>
      <div style={{ marginLeft: 16, flex: 2, fontStyle: 'italic', color: '#555' }}>
        {descriptions[selected]}
      </div>
    </div>
  );
}

export default MethodSelector;
