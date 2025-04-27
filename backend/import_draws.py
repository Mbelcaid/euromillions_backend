import requests
from sqlalchemy.orm import Session
from backend.database import SessionLocal, Draw
import json

def fetch_draws():
    url = "https://euromillions.api.pedromealha.dev/draws"
    headers = {"accept": "application/json"}
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()

def store_draws(draws):
    session = SessionLocal()
    for draw in draws:
        # Validation et unicité
        if session.query(Draw).filter_by(draw_id=draw["draw_id"]).first():
            continue  # Déjà stocké
        new_draw = Draw(
            date=draw["date"],
            draw_id=draw["draw_id"],
            has_winner=draw["has_winner"],
            numbers=json.dumps(draw["numbers"]),
            stars=json.dumps(draw["stars"]),
            prize=draw["prize"]
        )
        session.add(new_draw)
    session.commit()
    session.close()

def import_and_store():
    draws = fetch_draws()
    store_draws(draws)

if __name__ == "__main__":
    import_and_store()
