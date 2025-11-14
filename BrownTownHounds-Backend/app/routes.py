from flask import (
    render_template,
    flash,
    redirect,
    url_for,
    request,
    jsonify,
)  # flask modules
from app import app, db  # importing the app config file and the sqlite db
from app.forms import (
    RegistrationForm,
    wrapper_func,
    CharacterDetailsForm,
    PerkPointCheckboxes,
    PartyForm,
    PartyRegistrationForm,
)  # pulling in the RegistrationForm class from our forms.py script (located in app folder)
from app.models import (
    Character,
    Class,
    Character_Perk,
    Perk,
    Class_Perk,
    Notes,
    RetiredCharacter,
    Party,
    PartyAchievements,
    PartyNotes,
)  # pulling in the Character and Class classes from models.py script (located in app folder)
import sqlalchemy as sa  # importing sql alchemy module. naming it sa
from sqlalchemy import and_
import math


# main page load
@app.route("/api/characters", methods=["GET", "POST"])
def get_characters():
    if request.method == "POST":
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON body"}), 400

        with db.session.begin():  # this allows flush to work. will commit on success, and rollback on failure.
            char = Character(name=data["name"], class_id=data["class_id"])
            perks = db.session.scalars(
                sa.select(Class_Perk)
                .where(Class_Perk.class_id == data["class_id"])
                .order_by(Class_Perk.perk_id)
            ).all()

            db.session.add(char)
            db.session.flush()  # Holds the change in memory until the with is complete

            db.session.add_all(
                [
                    Character_Perk(character_id=char.id, perk_id=pid.perk_id)
                    for pid in perks
                ]
            )

    get_characters = sa.select(
        Character
    )  # Selecting the Character class to get list of characters from DB
    characters = db.session.scalars(
        get_characters
    ).all()  # storing existing DB entries from Character table

    # Store characters and their details to a list to be used by REACT frontend
    charactersList = [
        {
            "id": char.id,
            "name": char.name,
            "level": char.level,
            "xp": char.xp,
            "gold": char.gold,
            "perk_points": char.perk_points,
        }
        for char in characters
    ]

    return jsonify(charactersList)


@app.route("/api/characters/<int:char_id>", methods=["GET", "POST", "PATCH", "DELETE"])
def get_character_details(char_id):
    if request.method == "DELETE":
        char = Character.query.filter_by(id=char_id).first()
        if not char:
            return jsonify({"error": "Character not found"}), 404
        else:
            retireCharacter = RetiredCharacter(
                name=char.name, level=char.level, gold=char.gold, class_id=char.class_id
            )
            db.session.add(retireCharacter)
            handle_delete_button(Character, char.id)
            return "", 204

    char = db.session.get(Character, char_id)

    if not char:
        return jsonify({"error": "Character not found"}), 404

    if request.method == "PATCH":
        data = request.get_json()

        if not data:
            return jsonify({"error": "Missing JSON body"}), 400

        if "gold" in data:
            char.gold = data["gold"]
        if "xp" in data:
            char.xp = data["xp"]
            SetCharacterLevel(int(char.xp), char)
        if "perk_points" in data:
            char.perk_points = data["perk_points"]

        db.session.commit()
        db.session.refresh(char)

    # Store characters and their details to a list to be used by REACT frontend
    character_data = {
        "id": char.id,
        "name": char.name,
        "level": char.level,
        "xp": char.xp,
        "gold": char.gold,
        "perk_points": char.perk_points,
        "class_name": char.class_name.name,
        "class_id": char.class_id,
    }

    return jsonify(character_data)


@app.route("/api/characters/<int:char_id>/perks", methods=["GET", "PATCH"])
def get_character_perks(char_id):
    char_perks = db.session.scalars(
        sa.select(Character_Perk)
        .where(Character_Perk.character_id == char_id)
        .order_by(Character_Perk.perk_id)
    ).all()
    if request.method == "PATCH":
        data = request.get_json()

        perk = db.session.get(Character_Perk, (char_id, data["perk_id"]))
        perk.times_unlocked = data["times_unlocked"]

        db.session.commit()

    character_perk_data = [
        {
            "perk_id": p.perk_id,
            "perk_name": p.perk.name,
            "times_unlocked": p.times_unlocked,
        }
        for p in char_perks
    ]

    return jsonify(character_perk_data)


@app.route("/api/retiredcharacters", methods=["GET"])
def retired_characters():
    get_retiredChars = sa.select(RetiredCharacter)
    retired_chars = db.session.scalars(get_retiredChars).all()

    char_list = [
        {
            "name": char.name,
            "level": char.level,
            "gold": char.gold,
            "class": char.class_name.name,
        }
        for char in retired_chars
    ]

    return jsonify(char_list)


@app.route("/api/characters/<int:char_id>/notes", methods=["GET", "POST", "PATCH"])
def character_notes(char_id):
    notes = Notes.query.filter_by(character_id=char_id).all()

    if request.method == "POST":
        data = request.get_json()

        new_note = Notes(character_id=char_id, text=data["text"])
        db.session.add(new_note)
        db.session.commit()
        notes = Notes.query.filter_by(character_id=char_id).all()

    notes_list = [
        {"id": note.id, "text": note.text, "timestamp": note.timestamp}
        for note in notes
    ]

    return jsonify(notes_list)


@app.route("/api/characters/<int:char_id>/notes/<int:note_id>", methods=["DELETE"])
def delete_character_note(char_id, note_id):
    note = Notes.query.filter_by(id=note_id, character_id=char_id).first()
    if not note:
        return jsonify({"error": "Note not found"}), 404

    handle_delete_button(Notes, note.id)
    return "", 204


@app.route("/api/parties", methods=["GET", "POST"])
def get_parties():
    get_parties = sa.select(Party)
    parties = db.session.scalars(get_parties).all()

    if request.method == "POST":
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON body"}), 400

        party = Party(name=data["party_name"])
        db.session.add(party)
        db.session.commit()

        return jsonify({"id": party.id, "name": party.name}), 201

    # Store characters and their details to a list to be used by REACT frontend
    partiesList = [
        {
            "id": party.id,
            "name": party.name,
            "reputation": party.reputation,
            "location": party.location,
        }
        for party in parties
    ]

    return jsonify(partiesList)


@app.route("/api/parties/<int:party_id>/notes", methods=["GET", "POST", "PATCH"])
def party_notes(party_id):
    partyNotes = PartyNotes.query.filter_by(party_id=party_id).all()

    if request.method == "POST":
        data = request.get_json()

        new_note = PartyNotes(party_id=party_id, text=data["text"])

        db.session.add(new_note)
        db.session.commit()

        partyNotes = PartyNotes.query.filter_by(party_id=party_id).all()

    partyNotesList = [
        {"id": note.id, "text": note.text, "timestamp": note.timestamp}
        for note in partyNotes
    ]

    return jsonify(partyNotesList)


@app.route("/api/parties/<int:party_id>/achievements", methods=["GET", "POST", "PATCH"])
def party_achievements(party_id):
    partyAchievements = PartyAchievements.query.filter_by(party_id=party_id).all()

    if request.method == "POST":
        data = request.get_json()

        new_achievement = PartyAchievements(party_id=party_id, text=data["text"])

        db.session.add(new_achievement)
        db.session.commit()

        partyAchievements = PartyAchievements.query.filter_by(party_id=party_id).all()

    partyAchievementsList = [
        {
            "id": achievement.id,
            "text": achievement.text,
            "timestamp": achievement.timestamp,
        }
        for achievement in partyAchievements
    ]

    return jsonify(partyAchievementsList)


@app.route("/api/parties/<int:party_id>/notes/<int:note_id>", methods=["DELETE"])
def delete_party_note(party_id, note_id):
    note = PartyNotes.query.filter_by(id=note_id, party_id=party_id).first()
    if not note:
        return jsonify({"error": "Note not found"}), 404
    else:
        handle_delete_button(PartyNotes, note.id)
        return "", 204


@app.route("/api/parties/<int:party_id>", methods=["GET", "POST", "PATCH", "DELETE"])
def get_party_details(party_id):
    party = db.session.get(Party, party_id)
    if not party:
        return jsonify({"error": "Party not found"}), 404

    # Store characters and their details to a list to be used by REACT frontend
    party_data = {
        "id": party.id,
        "name": party.name,
        "reputation": party.reputation,
        "location": party.location,
    }

    if request.method == "PATCH":
        data = request.get_json()

        if not data:
            jsonify({"error": "Missing JSON body"}), 400

        if "reputation" in data:
            party.reputation = data["reputation"]
        if "location" in data:
            party.location = data["location"]
            party_data["location"] = data["location"]

        db.session.commit()

    if request.method == "DELETE":
        party = Party.query.filter_by(id=party_id).first()
        if not party:
            return jsonify({"error": "Character not found"}), 404
        else:
            handle_delete_button(Party, party.id)
            return "", 204

    return jsonify(party_data)


@app.route("/api/classes", methods=["GET"])
def get_classes():
    get_classes = sa.select(Class)
    classes = db.session.scalars(get_classes).all()

    class_data = [{"id": _class.id, "class_name": _class.name} for _class in classes]

    return jsonify(class_data)


@app.route("/api/classes/<int:class_id>", methods=["GET"])
def get_class_details(class_id):
    perks = db.session.scalars(
        sa.select(Class_Perk)
        .where(Class_Perk.class_id == class_id)
        .order_by(Class_Perk.perk_id)
    ).all()

    class_data = [
        {
            "perk_id": perk.perk_id,
            "perk_name": perk.perk.name,
            "times_unlockable": perk.times_unlockable,
        }
        for perk in perks
    ]

    return jsonify(class_data)


def handle_delete_button(model_class, id):
    id_to_delete = db.session.get(model_class, int(id))
    if id_to_delete:
        db.session.delete(id_to_delete)
        db.session.commit()


def SetCharacterLevel(xp, char):
    """
    Calculate level based on XP
    """
    level_thresholds = [
        (500, 9),
        (420, 8),
        (345, 7),
        (275, 6),
        (210, 5),
        (150, 4),
        (95, 3),
        (45, 2),
    ]
    for threshold, level in level_thresholds:
        if xp >= threshold:
            char.level = level
            break
    else:
        char.level = 1
