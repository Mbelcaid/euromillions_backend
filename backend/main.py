from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json
from collections import Counter
import random

from fastapi import FastAPI
from backend.import_draws import import_and_store  # adapte ce chemin si besoin
from backend.database import Draw, SessionLocal, Prediction
from backend.markov import HigherOrderMarkovChain

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Autorise toutes les origines pour le développement
    allow_credentials=True,  # Active l'en-tête CORS Access-Control-Allow-Origin
    allow_methods=["*"],
    allow_headers=["*"],
)

'''
# APScheduler cron removed: manual import via /import-draws endpoint only
'''

@app.get("/")
def root():
    return {"message": "API EuroMillions disponible. Consulte /docs pour la documentation."}

@app.post("/import-draws")
def import_draws():
    # Import manuel des tirages
    try:
        import_and_store()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

def _percentile(data, percent):
    data_sorted = sorted(data)
    idx = int(percent * len(data_sorted))
    idx = max(0, min(idx, len(data_sorted)-1))
    return data_sorted[idx]

@app.get("/predict/markov")
def predict_markov(order: int = 2, num_predictions: int = 5):
    session = SessionLocal()
    draws = session.query(Draw).order_by(Draw.id).all()
    # prédiction pour le tirage le plus récent (backtest)
    next_draw_id = draws[-1].draw_id if draws else None
    session.close()
    # Préparation des données pour Markov (numéros uniquement)
    draws_history = [json.loads(d.numbers) for d in draws]
    if len(draws_history) < order + 1:
        return {"success": False, "error": "Pas assez de tirages pour entraîner le modèle."}
    recent_draws = draws_history[-order:]
    markov = HigherOrderMarkovChain(order)
    markov.train(draws_history)
    predictions = markov.predict(recent_draws, num_predictions)
    # Bootstrap confiance sur la probabilité du 1er tirage
    B = 1000
    proba_boot = []
    for _ in range(B):
        sample = [random.choice(draws_history) for _ in draws_history]
        m2 = HigherOrderMarkovChain(order)
        m2.train(sample)
        preds2 = m2.predict(recent_draws, num_predictions)
        proba_boot.append(preds2[0].get('probability', 0))
    lower = _percentile(proba_boot, 0.025)
    upper = _percentile(proba_boot, 0.975)
    confidence = {'lower': lower, 'upper': upper}
    # Enregistrer la prédiction en base
    session2 = SessionLocal()
    for pred in predictions:
        session2.add(Prediction(
            method="markov",
            order=order,
            num_predictions=num_predictions,
            numbers=json.dumps(pred["numbers"]),
            stars=json.dumps(pred["stars"]),
            confidence=json.dumps(confidence),
            target_draw_id=next_draw_id
        ))
    session2.commit()
    session2.close()
    return {
        "success": True,
        "predictions": predictions,
        "confidence": confidence,
        "method": f"Markov ordre {order}"
    }

@app.get("/predict/frequency")
def predict_frequency(num_predictions: int = 1):
    session = SessionLocal()
    draws = session.query(Draw).order_by(Draw.id).all()
    # prédiction pour le tirage le plus récent (backtest)
    next_draw_id = draws[-1].draw_id if draws else None
    session.close()
    numbers_counter = Counter()
    stars_counter = Counter()
    for d in draws:
        nums = [int(x) for x in json.loads(d.numbers)]
        stars = [int(x) for x in json.loads(d.stars)]
        numbers_counter.update(nums)
        stars_counter.update(stars)
    numbers_sorted = [num for num, _ in numbers_counter.most_common()]
    stars_sorted = [star for star, _ in stars_counter.most_common()]
    predictions = [
        {"numbers": numbers_sorted[:5], "stars": stars_sorted[:2]}
        for _ in range(num_predictions)
    ]
    # Enregistrer la prédiction en base
    session2 = SessionLocal()
    for pred in predictions:
        session2.add(Prediction(
            method="frequency",
            order=None,
            num_predictions=num_predictions,
            numbers=json.dumps(pred["numbers"]),
            stars=json.dumps(pred["stars"]),
            confidence=json.dumps({}),
            target_draw_id=next_draw_id
        ))
    session2.commit()
    session2.close()
    return {"success": True, "predictions": predictions, "method": "Fréquence simple"}

@app.get("/stats/frequencies")
def get_frequencies(period: str = "all"):
    session = SessionLocal()
    draws = session.query(Draw).order_by(Draw.id).all()
    session.close()
    numbers_counter = Counter()
    stars_counter = Counter()
    for d in draws:
        nums = [int(x) for x in json.loads(d.numbers)]
        stars = [int(x) for x in json.loads(d.stars)]
        numbers_counter.update(nums)
        stars_counter.update(stars)
    hot_numbers = [num for num, _ in numbers_counter.most_common(5)]
    cold_numbers = [num for num, _ in numbers_counter.most_common()[-5:]]
    hot_stars = [star for star, _ in stars_counter.most_common(2)]
    cold_stars = [star for star, _ in stars_counter.most_common()[-2:]]
    return {
        "numbers_frequency": dict(numbers_counter),
        "stars_frequency": dict(stars_counter),
        "hot_numbers": hot_numbers,
        "cold_numbers": cold_numbers,
        "hot_stars": hot_stars,
        "cold_stars": cold_stars
    }

@app.get("/stats/gaps")
def get_gaps():
    session = SessionLocal()
    try:
        draws = session.query(Draw).order_by(Draw.draw_id).all()
        # Collect occurrences index pour chaque numéro
        occurrences = {n: [] for n in range(1, 51)}
        for idx, d in enumerate(draws):
            nums = json.loads(d.numbers)
            for num in nums:
                try:
                    n = int(num)
                except (TypeError, ValueError):
                    continue
                if n in occurrences:
                    occurrences[n].append(idx)
        # Calcul de l'écart moyen (en nombre de tirages)
        gaps = []
        for num in range(1, 51):
            occ = occurrences[num]
            if len(occ) < 2:
                avg_gap = None
            else:
                diffs = [occ[i] - occ[i-1] for i in range(1, len(occ))]
                avg_gap = sum(diffs) / len(diffs)
            gaps.append({"number": num, "avg_gap": avg_gap})
        return {"success": True, "gaps": gaps}
    except Exception as e:
        import traceback; traceback.print_exc()
        return {"success": False, "error": str(e)}
    finally:
        session.close()

@app.get("/performance")
def get_performance():
    session = SessionLocal()
    preds = session.query(Prediction).all()
    draws = session.query(Draw).all()
    session.close()
    # map draw_id -> actual numbers/stars
    draws_map = {d.draw_id: (json.loads(d.numbers), json.loads(d.stars)) for d in draws}
    total_eval = 0
    total_correct_nums = 0
    total_correct_stars = 0
    for p in preds:
        if p.target_draw_id and p.target_draw_id in draws_map:
            actual_nums, actual_stars = draws_map[p.target_draw_id]
            pred_nums = json.loads(p.numbers)
            pred_stars = json.loads(p.stars)
            correct_nums = len(set(pred_nums) & set(actual_nums))
            correct_stars = len(set(pred_stars) & set(actual_stars))
            total_eval += 1
            total_correct_nums += correct_nums
            total_correct_stars += correct_stars
    if total_eval == 0:
        return {"success": False, "error": "Aucune prédiction évaluable."}
    accuracy_nums = total_correct_nums / (total_eval * 5)
    accuracy_stars = total_correct_stars / (total_eval * 2)
    return {
        "success": True,
        "total_predictions": len(preds),
        "evaluated": total_eval,
        "accuracy": {"numbers": accuracy_nums, "stars": accuracy_stars}
    }

@app.get("/performance/history")
def get_performance_history(method: str = None, min_accuracy: float = 0.0):
    session = SessionLocal()
    draws = session.query(Draw).order_by(Draw.draw_id).all()
    # Map draw_id to actual numbers, stars, date
    draws_map = {d.draw_id: (json.loads(d.numbers), json.loads(d.stars), d.date) for d in draws}
    preds = session.query(Prediction).all()
    from collections import defaultdict
    groups = defaultdict(list)
    for p in preds:
        if p.target_draw_id and p.target_draw_id in draws_map:
            if method and p.method != method:
                continue
            groups[p.target_draw_id].append(p)
    history = []
    for draw_id in sorted(groups):
        ps = groups[draw_id]
        actual_nums, actual_stars, date = draws_map[draw_id]
        total_preds = len(ps)
        correct_nums = sum(len(set(json.loads(p.numbers)) & set(actual_nums)) for p in ps)
        correct_stars = sum(len(set(json.loads(p.stars)) & set(actual_stars)) for p in ps)
        acc_nums = correct_nums / (total_preds * 5)
        acc_stars = correct_stars / (total_preds * 2)
        if acc_nums >= min_accuracy:
            history.append({
                "draw_id": draw_id,
                "date": date,
                "accuracy_numbers": acc_nums,
                "accuracy_stars": acc_stars
            })
    session.close()
    return {"success": True, "history": history}