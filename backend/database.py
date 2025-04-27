from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import json
import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./euromillions.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Draw(Base):
    __tablename__ = "draws"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    draw_id = Column(Integer, unique=True, index=True)
    has_winner = Column(Boolean)
    numbers = Column(String)  # Stocké en JSON
    stars = Column(String)    # Stocké en JSON
    prize = Column(Float)

    def as_dict(self):
        return {
            "id": self.id,
            "date": self.date,
            "draw_id": self.draw_id,
            "has_winner": self.has_winner,
            "numbers": json.loads(self.numbers),
            "stars": json.loads(self.stars),
            "prize": self.prize,
        }

# Création des tables
Base.metadata.create_all(bind=engine)

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    method = Column(String, index=True)
    order = Column(Integer, nullable=True)
    num_predictions = Column(Integer, nullable=False)
    numbers = Column(String)  # JSON list of predicted numbers
    stars = Column(String)    # JSON list of predicted stars
    confidence = Column(String)  # JSON confidence intervals
    target_draw_id = Column(Integer, nullable=True, index=True)

# Assurer la création de la table Prediction
Base.metadata.create_all(bind=engine)
