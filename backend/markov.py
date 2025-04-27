import random
from collections import defaultdict, Counter

class HigherOrderMarkovChain:
    def __init__(self, order=2):
        self.order = order
        self.transition_counts = defaultdict(lambda: defaultdict(int))
        self.transition_probs = defaultdict(dict)
        self.sequences = defaultdict(list)

    def draw_to_key(self, draw):
        # Assure que les numéros sont triés
        return ','.join(str(x) for x in sorted(map(int, draw)))

    def train(self, draws_history):
        if len(draws_history) < self.order + 1:
            raise ValueError(f"Besoin d'au moins {self.order + 1} tirages pour l'analyse d'ordre {self.order}")
        for i in range(len(draws_history) - (self.order)):
            condition = [self.draw_to_key(draws_history[i + j]) for j in range(self.order)]
            condition_key = '|'.join(condition)
            next_draw = draws_history[i + self.order]
            next_draw_key = self.draw_to_key(next_draw)
            self.transition_counts[condition_key][next_draw_key] += 1
            self.sequences[condition_key].append(next_draw)
        self.calculate_probabilities()

    def calculate_probabilities(self):
        for condition_key, next_draws in self.transition_counts.items():
            total = sum(next_draws.values())
            for next_draw_key, count in next_draws.items():
                self.transition_probs[condition_key][next_draw_key] = count / total if total > 0 else 0

    def predict(self, recent_draws, num_predictions=5):
        if len(recent_draws) < self.order:
            raise ValueError(f"Besoin d'au moins {self.order} tirages récents pour prédire")
        condition = [self.draw_to_key(recent_draws[-self.order + i]) for i in range(self.order)]
        condition_key = '|'.join(condition)
        if condition_key not in self.transition_probs:
            return self.fallback_prediction(recent_draws, num_predictions)
        sorted_draws = sorted(
            self.transition_probs[condition_key].items(),
            key=lambda item: item[1], reverse=True
        )
        predictions = []
        for draw_key, prob in sorted_draws[:num_predictions]:
            numbers = list(map(int, draw_key.split(',')))
            # Étoiles : non présentes dans la clé, donc on génère aléatoirement
            stars = sorted(random.sample(range(1, 13), 2))
            predictions.append({
                'numbers': numbers,
                'stars': stars,
                'probability': prob
            })
        return predictions

    def fallback_prediction(self, recent_draws, num_predictions):
        frequency = Counter()
        for draw in recent_draws:
            for num in draw:
                frequency[int(num)] += 1
        sorted_by_freq = [num for num, _ in frequency.most_common()]
        predictions = []
        for i in range(num_predictions):
            candidate = sorted_by_freq[:3] if len(sorted_by_freq) >= 3 else sorted_by_freq[:]
            while len(candidate) < 5:
                n = random.randint(1, 50)
                if n not in candidate:
                    candidate.append(n)
            stars = sorted(random.sample(range(1, 13), 2))
            predictions.append({
                'numbers': sorted(candidate),
                'stars': stars,
                'probability': 1 / (i + 1) * 0.01
            })
        return predictions

    def calculate_confidence_interval(self, recent_draws):
        if len(recent_draws) < self.order:
            return {'lower': 0.001, 'upper': 0.005}
        condition = [self.draw_to_key(recent_draws[-self.order + i]) for i in range(self.order)]
        condition_key = '|'.join(condition)
        if condition_key not in self.transition_probs:
            base_conf = 0.01 / self.order
            return {'lower': base_conf * 0.5, 'upper': base_conf * 1.5}
        total_obs = sum(self.transition_counts[condition_key].values())
        conf_factor = min(0.05, (total_obs ** 0.5) / 100)
        max_prob = max(self.transition_probs[condition_key].values(), default=0)
        return {
            'lower': max(0.001, max_prob - conf_factor),
            'upper': min(0.1, max_prob + conf_factor)
        }
