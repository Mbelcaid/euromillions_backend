# EuroMillions Predictive Web App

## Cahier des charges

1. **Acquisition & traitement des données historiques**
   - Importation automatisée des résultats officiels depuis le lancement de l'Euro Millions
   - Mise à jour automatique après chaque tirage via API ou web scraping
   - Nettoyage et validation des données pour assurer leur intégrité
   - Stockage optimisé pour des requêtes rapides et efficaces

2. **Tableau de bord statistique complet**
   - Visualisation de la fréquence d'apparition de chaque numéro principal (1-50) et étoile (1-12)
   - Affichage des "numéros chauds" (plus fréquents) et "numéros froids" (moins fréquents)
   - Graphiques d'évolution des fréquences sur différentes périodes
   - Statistiques sur les écarts entre apparitions successives

3. **Analyse approfondie des modèles & tendances**
   - Identification des paires et triplets fréquents
   - Analyse de la distribution des sommes et moyennes
   - Détection de séquences récurrentes (consecutifs, pair/impair)
   - Calcul des corrélations entre numéros principaux et étoiles

4. **Système prédictif multicritère**
   - Génération de combinaisons via différentes méthodes (fréquence, régression, Markov)
   - Paramètres ajustables (pondération récence vs historique)
   - Filtres personnalisés (exclure/favoriser certains numéros)
   - Score de confiance pour chaque combinaison

5. **Historique & mesure de performance**
   - Enregistrement des combinaisons suggérées
   - Évaluation du taux de réussite par méthode
   - Affinage automatique des algorithmes basé sur performance

6. **Interface utilisateur personnalisable**
   - Profils utilisateurs et paramètres sauvegardés
   - Notifications tirages à venir et résultats
   - Mode comparaison entre méthodes
   - Export des données (PDF, CSV)

7. **Outils complémentaires**
   - Calculateur de probabilités pour combinaisons spécifiques
   - Section éducative expliquant les principes statistiques

---

## Avancement actuel

- **Backend**
  - Import des tirages & endpoint `/import-draws` ✓
  - API `/stats/frequencies`, `/predict/markov`, `/predict/frequency` ✓
  - Modèle Markov et fréquence simple opérationnels ✓
  - Endpoint `/stats/gaps` pour écarts moyens ✓
  - Suppression du scheduler cron, import manuel via le bouton ✓

- **Frontend**
  - Import manuel des tirages via `ImportDraws` ✓
  - Sélecteur de méthode avec descriptions ✓
  - Explications pour l'ordre Markov & nombre de prédictions ✓
  - Bouton de régénération sans rechargement ✓
  - Aide textuelle inline pour chaque dashboard ✓
  - Passage direct à l'étape de génération ✓

## À faire

- **Backend**
  - Endpoints avancés : paires/triplets, distributions, corrélations
  - Stockage et suivi des prédictions + calcul de performance
  - Méthodes multicritères et filtres utilisateurs
  - Export CSV / PDF

- **Frontend**
  - Graphiques d'évolution (Chart.js ou Recharts)
  - Dashboard paires/triplets, distributions
  - Formulaire de filtres avancés
  - Historique des prédictions et comparaison des méthodes
  - Profils utilisateurs & notifications
  - Section probabilités & module éducatif

## Suggestions de méthodes statistiques avancées

- **Apriori & règles d'association** pour extraire paires/triplets fréquents
- **Analyse de séries temporelles** (ARIMA, SARIMA)
- **Modèles bayésiens** (réseaux bayésiens) pour dépendances complexes
- **Machine Learning** : Random Forest, XGBoost, régression logistique
- **Deep Learning** : LSTM / RNN pour séquences temporelles
- **Simulation Monte Carlo** pour évaluation probabiliste

## Filtrage par période

Le filtrage par période (dernier mois, 6 mois, etc.) permet de détecter les tendances récentes comparées au comportement global.  
Si vous jugez que seules les fréquences historiques globales sont pertinentes, cet endpoint peut être simplifié ou retiré.
