import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export const importDraws = async () => {
  return axios.post(`${API_BASE}/import-draws`);
};

export const predictMarkov = async (order = 2, num_predictions = 5) => {
  return axios.get(`${API_BASE}/predict/markov`, {
    params: { order, num_predictions },
  });
};

export const getFrequencies = async () => {
  return axios.get(`${API_BASE}/stats/frequencies`);
};

export const predictFrequency = async (num_predictions = 1) => {
  return axios.get(`${API_BASE}/predict/frequency`, { params: { num_predictions } });
};

export const getPerformance = async () => {
  return axios.get(`${API_BASE}/performance`);
};

export const getPerformanceHistory = async (method = undefined, min_accuracy = 0.0) => {
  return axios.get(`${API_BASE}/performance/history`, { params: { method, min_accuracy } });
};

export const getGaps = async () => {
  return axios.get(`${API_BASE}/stats/gaps`);
};

// D'autres fonctions API seront ajoutées pour la génération et la récupération des résultats