import json
from app import create_app, db
from app.models import Class, Perk, Class_Perk
import sqlalchemy as sa

app = create_app()

# Load JSON file
with open("class_data.json", "r") as f:
    data = json.load(f)

with app.app_context():
    for class_data in data["classes"]:
        existing_class = Class.query.filter_by(name=class_data["name"]).first()
        if not existing_class:
            new_class = Class(name=class_data["name"])
            db.session.add(new_class)

    for perk_data in data["perks"]:
        existing_perk = Perk.query.filter_by(name=perk_data["name"]).first()
        if not existing_perk:
            new_perk = Perk(name=perk_data["name"])
            db.session.add(new_perk)

    db.session.commit()

    for cp in data["class_perks"]:
        class_obj = Class.query.filter_by(name=cp["class_name"]).first()
        perk_obj = Perk.query.filter_by(name=cp["perk_name"]).first()

        if class_obj and perk_obj:
            link = Class_Perk(class_=class_obj, perk=perk_obj, times_unlockable=1)
        db.session.add(link)
        
    db.session.commit()