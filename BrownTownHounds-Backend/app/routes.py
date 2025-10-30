from flask import render_template, flash, redirect, url_for, request, jsonify #flask modules
from app import app,db #importing the app config file and the sqlite db
from app.forms import RegistrationForm, wrapper_func, CharacterDetailsForm, PerkPointCheckboxes, PartyForm, PartyRegistrationForm  #pulling in the RegistrationForm class from our forms.py script (located in app folder)
from app.models import Character, Class, Character_Perk, Perk, Class_Perk, Notes, RetiredCharacter,Party, PartyAchievements, PartyNotes #pulling in the Character and Class classes from models.py script (located in app folder)
import sqlalchemy as sa #importing sql alchemy module. naming it sa
from sqlalchemy import and_
import math

#main page load
@app.route('/api/characters', methods=['GET', 'POST'])
def get_characters():
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing JSON body'}), 400
        
        with db.session.begin(): #this allows flush to work. will commit on success, and rollback on failure.
            char = Character(name=data["name"], class_id=data["class_id"])
            perks = db.session.scalars(sa.select(Class_Perk).where(Class_Perk.class_id == data["class_id"]).order_by(Class_Perk.perk_id)).all()

            db.session.add(char) 
            db.session.flush() #Holds the change in memory until the with is complete

            db.session.add_all([Character_Perk(character_id=char.id, perk_id=pid.perk_id)
                                for pid in perks])
            
    get_characters = sa.select(Character) #Selecting the Character class to get list of characters from DB
    characters = db.session.scalars(get_characters).all() #storing existing DB entries from Character table

    #Store characters and their details to a list to be used by REACT frontend
    charactersList = [
        {
            'id': char.id,
            'name': char.name,
            'level': char.level,
            'xp': char.xp,
            'gold': char.gold,
            'perk_points': char.perk_points,
        }
        for char in characters
        
        ]

    return jsonify(charactersList)


@app.route('/api/characters/<int:char_id>', methods=['GET','POST','PATCH','DELETE'])
def get_character_details(char_id):
    if request.method == 'DELETE':
        char = Character.query.filter_by(id = char_id).first()
        if not char:
            return jsonify({"error": "Character not found"}), 404
        else:
            retireCharacter = RetiredCharacter(name=char.name,level=char.level,gold=char.gold,class_id=char.class_id)
            db.session.add(retireCharacter)
            handle_delete_button(Character, char.id)
            return '', 204

    char = db.session.get(Character, char_id)

    if not char:
        return jsonify({'error': 'Character not found'}), 404

    if request.method == 'PATCH':
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Missing JSON body'}), 400

        if 'gold' in data:
            char.gold = data['gold']
        if 'xp' in data:
            char.xp = data['xp']
            SetCharacterLevel(int(char.xp),char)
        if 'perk_points' in data:
            char.perk_points = data['perk_points']

        db.session.commit()
        db.session.refresh(char)

    #Store characters and their details to a list to be used by REACT frontend
    character_data = {
            'id': char.id,
            'name': char.name,
            'level': char.level,
            'xp': char.xp,
            'gold': char.gold,
            'perk_points': char.perk_points,
            'class_name': char.class_name.name,
            'class_id': char.class_id,
        }

    return jsonify(character_data)

@app.route('/api/characters/<int:char_id>/perks', methods=['GET','PATCH'])
def get_character_perks(char_id):
    char_perks = db.session.scalars(sa.select(Character_Perk).where(Character_Perk.character_id == char_id).order_by(Character_Perk.perk_id)).all()
    if request.method == 'PATCH':
        data = request.get_json()

        perk = db.session.get(Character_Perk, (char_id, data["perk_id"]))
        perk.times_unlocked = data["times_unlocked"]

        db.session.commit()

    character_perk_data = [
        {
            'perk_id': p.perk_id,
            'perk_name': p.perk.name,
            'times_unlocked': p.times_unlocked,
        }
        for p in char_perks 
     ]
    
    return jsonify(character_perk_data)

@app.route('/api/retiredcharacters', methods=['GET'])
def retired_characters():
    get_retiredChars = sa.select(RetiredCharacter)
    retired_chars = db.session.scalars(get_retiredChars).all()

    char_list=[{
        'name': char.name,
        'level': char.level,
        'gold': char.gold,
        'class': char.class_name.name
    }for char in retired_chars]

    return jsonify(char_list)


@app.route('/api/characters/<int:char_id>/notes', methods=['GET','POST','PATCH'])
def character_notes(char_id):
    notes = Notes.query.filter_by(character_id=char_id).all()

    if request.method == 'POST':
        data = request.get_json()

        new_note = Notes(character_id=char_id,text=data["text"])
        db.session.add(new_note)
        db.session.commit()
        notes = Notes.query.filter_by(character_id=char_id).all()

    notes_list = [{
        'id': note.id,
        'text': note.text,
        'timestamp': note.timestamp
    } for note in notes]

    return jsonify(notes_list)


@app.route('/api/characters/<int:char_id>/notes/<int:note_id>', methods=['DELETE'])
def delete_character_note(char_id,note_id):
    note = Notes.query.filter_by(id=note_id, character_id=char_id).first()
    if not note:
        return jsonify({"error": "Note not found"}), 404
    
    handle_delete_button(Notes, note.id)
    return '', 204


@app.route('/api/parties', methods=['GET', 'POST'])
def get_parties():
    get_parties = sa.select(Party)
    parties = db.session.scalars(get_parties).all()

    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing JSON body'}), 400

        party = Party(name = data["party_name"])
        db.session.add(party)
        db.session.commit()

        return jsonify({'id': party.id, 'name': party.name}), 201

    #Store characters and their details to a list to be used by REACT frontend
    partiesList = [
        {
            'id': party.id,
            'name': party.name,
            'reputation': party.reputation,
            'location': party.location
        }
        for party in parties]
    
    return jsonify(partiesList)  

@app.route('/api/parties/<int:party_id>/notes', methods=['GET', 'POST', 'PATCH'])
def party_notes(party_id):
    partyNotes = PartyNotes.query.filter_by(party_id=party_id).all()

    if request.method == 'POST':
        data = request.get_json()

        new_note = PartyNotes(party_id=party_id,text=data["text"])       

        db.session.add(new_note)
        db.session.commit()

        partyNotes = PartyNotes.query.filter_by(party_id=party_id).all()

    partyNotesList = [
    {
        'id': note.id,
        'text': note.text,
        'timestamp': note.timestamp
    }
    for note in partyNotes] 

    return jsonify(partyNotesList)

@app.route('/api/parties/<int:party_id>/achievements', methods=['GET', 'POST', 'PATCH'])
def party_achievements(party_id):
    partyAchievements = PartyAchievements.query.filter_by(party_id=party_id).all()

    if request.method == 'POST':
        data = request.get_json()

        new_achievement = PartyAchievements(party_id=party_id,text=data["text"])

        db.session.add(new_achievement)
        db.session.commit()

        partyAchievements = PartyAchievements.query.filter_by(party_id=party_id).all()

    partyAchievementsList = [
        {
        'id': achievement.id,
        'text': achievement.text,
        'timestamp': achievement.timestamp,        
        } 
    for achievement in partyAchievements]

    return jsonify(partyAchievementsList)

@app.route('/api/parties/<int:party_id>/notes/<int:note_id>', methods=['DELETE'])
def delete_party_note(party_id, note_id):
    note =  PartyNotes.query.filter_by(id=note_id, party_id=party_id).first()
    if not note:
        return jsonify({"error": "Note not found"}), 404
    else:
        handle_delete_button(PartyNotes,note.id)
        return '', 204

@app.route('/api/parties/<int:party_id>', methods=['GET', 'POST', 'PATCH', 'DELETE'])
def get_party_details(party_id):
    party = db.session.get(Party, party_id)
    if not party:
        return jsonify({'error': 'Party not found'}), 404

    #Store characters and their details to a list to be used by REACT frontend
    party_data = {
            'id': party.id,
            'name': party.name,
            'reputation': party.reputation,
            'location': party.location
        }

    if request.method == 'PATCH':
        data = request.get_json()

        if not data:
            jsonify({'error': 'Missing JSON body'}), 400
        
        if 'reputation' in data:
            party.reputation = data['reputation']
        if 'location' in data:
            party.location = data['location']
            party_data['location'] = data['location']
                                                                                                                                                                                                                                                                                                                        
        db.session.commit()

    if request.method == 'DELETE':
        party = Party.query.filter_by(id = party_id).first()
        if not party:
            return jsonify({"error": "Character not found"}), 404
        else: 
            handle_delete_button(Party, party.id)
            return '', 204

    return jsonify(party_data)

@app.route('/api/classes', methods=['GET'])
def get_classes():
    get_classes = sa.select(Class)
    classes = db.session.scalars(get_classes).all()

    class_data = [
        {
        "id": _class.id,
        "class_name": _class.name
        }
        for _class in classes
    ]

    return jsonify(class_data)

@app.route('/api/classes/<int:class_id>', methods=['GET'])
def get_class_details(class_id):
    perks = db.session.scalars(sa.select(Class_Perk).where(Class_Perk.class_id == class_id).order_by(Class_Perk.perk_id)).all()

    class_data = [
        {
        "perk_id": perk.perk_id,
        "perk_name": perk.perk.name,
        "times_unlockable": perk.times_unlockable
        }
        for perk in perks
    ]

    return jsonify(class_data)

'''
API Code ↑

========================================================================================================================================================================
========================================================================================================================================================================

OLD Code ↓
'''

@app.route('/')
@app.route('/index', methods=['GET', 'POST'])
def index(): 
    get_characters = sa.select(Character) #Selecting the Character class to get list of characters from DB
    get_parties = sa.select(Party)
    characters = db.session.scalars(get_characters).all() #storing existing DB entries from Character table
    parties = db.session.scalars(get_parties).all()

    if request.method == 'POST':
        delete_char_id = request.form.get('delete_char_id')
        if delete_char_id:
            char = db.session.get(Character, int(delete_char_id))
            retired_char = RetiredCharacter(name = char.name, level = char.level, gold = char.gold, class_name=db.session.query(Class).filter(Class.id==char.class_id).first())
            db.session.add(retired_char)
            db.session.delete(char)
            db.session.commit()
            return redirect(url_for('index'))
    
          
    return render_template('index.html', title='Home', characters=characters, parties=parties) #passing this new dictionary ^ to the index.html page. on that page, they will be displayed.

#Register new character page
@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm() #pulling in the registrationform class from forms.py
    form.class_.choices = [(c.name) for c in Class.query.all()] #adding to a variable the list of class names from the Class DB (Class class in models)
    if form.validate_on_submit(): #once class has been selected, continue
        selected_class = form.class_.data #add selected class to a variable     
        char = Character(name=form.name.data, class_name=db.session.query(Class).filter(Class.name==selected_class).first()) #create character using the name inputted, and using the class_name relationship in the Character class to find the correct entry in the Class table

        #add and commit new character to the DB
        db.session.add(char) 
        db.session.commit()

        #flash congtulations message then redirect to the index page
        flash('Congratulations, you\'ve registered a new character!')
        return redirect(url_for('index'))
    
    return render_template('register.html', title='Register Character', form=form) #loads the register.html page initially, passing in the registration from details from the RegistrationForm() class (assigned above)

@app.route('/retired_characters', methods=['GET', 'POST'])
def RetiredCharacters():
    """
    Displays all retired characters
    """
    get_retired_characters = sa.select(RetiredCharacter)
    retired_characters = db.session.scalars(get_retired_characters).all()

    return render_template('retired_characters.html', title='Retired Characters', retired_characters=retired_characters)

@app.route('/create_party', methods=['GET', 'POST'])
def CreateParty():
    """
    Create a new party
    """
    form = PartyRegistrationForm()
    if form.validate_on_submit():
        party = Party(name = form.name.data)

        db.session.add(party) 
        db.session.commit()

        return redirect(url_for('index'))

    return render_template('create_party.html', title='Create Party', form=form)

@app.route('/party/<party_name>', methods=['GET', 'POST'])
def party(party_name):
    """
    Display party details: Name, Location, Achievements and Notes
    """
    party_obj = db.first_or_404(sa.select(Party).where(Party.name == party_name)) #Get party from database
    party_achievements = db.session.scalars(party_obj.achievements.select()).all() #Get all achievements for this party from database
    party_notes = db.session.scalars(party_obj.notes.select()).all() #Get all notes for this party from database
    shop_modifier = SetPartyShopModifier(party_obj.reputation)

    form = PartyForm(request.form,obj=party_obj) #instantiate part form

    if request.method == 'POST':
        #if you added a location, update the location DB field of this party
        if 'location' in request.form:
            if form.loc.data: party_obj.location = form.loc.data
        #if you adjusted your reputation, update the reputation DB field of this party
        elif 'reputation' in request.form:
            if form.reputation.data: party_obj.reputation = form.reputation.data
        #if you added an achievement, create a new index for this achievement in the PartyAchievement DB table
        elif 'achievement' in request.form:
            if form.achievement.data:
                new_achievement = PartyAchievements(text = form.achievement.data, party_id=party_obj.id)
                db.session.add(new_achievement)
        #if you added a note, create a new index for this note in the PartyNotes DB table
        elif 'note' in request.form:
            if form.note.data:
                new_party_note = PartyNotes(text = form.note.data, party_id=party_obj.id)
                db.session.add(new_party_note)
        
        #Create a list of dictionaries for delete buttons and assign the corresponding model class
        DELETE_HANDLERS = {
            'delete_achievement': PartyAchievements,
            'delete_party_note': PartyNotes
        }
        
        #Loop through the delete handlers and delete the DB index if the button was pressed
        for button_name, model_class in DELETE_HANDLERS.items():
            delete_id = request.form.get(button_name)
            if delete_id: handle_delete_button(model_class,delete_id)

        db.session.commit()
        return redirect(url_for('party', party_name = party_obj.name))


    return render_template('party.html', party=party_obj, party_name=party_name, form=form, party_achievements=party_achievements, party_notes=party_notes, shop_modifier=shop_modifier)

#Access specific character page. Pass in the character name with the dynamic selector <character>. This is taken from the charater.html page href.
@app.route('/character/<character>', methods=['GET', 'POST'])
def character(character):
    char = db.first_or_404(sa.select(Character).where(Character.name == character)) #if the character exists, store the information in the char var, otherwise present 404
    class_perks = db.session.scalars(sa.select(Class_Perk).where(Class_Perk.class_id == char.class_name.id).order_by(Class_Perk.perk_id)).all() #store all class perks for this character
    class_perks_detail = [(perk.perk.name, perk.times_unlockable) for perk in class_perks] #get all perks for character class, then add the names to a list
    char_unlocked_perks = [(cp.perk.name, cp.times_unlocked) for cp in char.char_perk] #adds all unlocked perks (found in char_perk table) to a set
    SetCharacterLevel(char.xp,char)
    char_notes = db.session.scalars(char.notes.select()).all()

    perks_form = wrapper_func(class_perks_detail,active_perk_checker(class_perks_detail,char_unlocked_perks)) #send in the class perks to the wrapper function, which will create a checkbox for each. Also send in active perks, and the number of times they've been unlocked

    charStats = CharacterDetailsForm(request.form, obj=char)
    perkForm = perks_form(request.form if request.method == 'POST' else None) #assigning the perks_form to form
    perkCheckboxes = CreatePerkCheckboxes(char)

    #if we POST when we save and the form is validated, success. Then check which form was validate. Depending on the form, run specific function
    if request.method == 'POST': 
        if charStats.validate():
            handle_char_stats_submission(char,charStats) #update char stats

        if perkForm.validate():
            handle_perk_form_submission(perkForm, char, char_unlocked_perks) #pdate unlocked perks

        if perkCheckboxes.validate(): 
            handle_perk_points_submission(char,perkCheckboxes) #update perk points (the checkmarks that indicate if you can unlock a new perk)

        #delete note if delete button was pressed
        delete_id = request.form.get('delete_note_id')
        if delete_id: handle_delete_button(Notes,delete_id)

        db.session.commit()
        return redirect(url_for('character', character=char.name))

    return render_template('character.html', char=char, form=perkForm, charStats=charStats, char_notes=char_notes, perkCheckboxes=perkCheckboxes)

def handle_delete_button(model_class,id):
        id_to_delete = db.session.get(model_class, int(id))
        if id_to_delete:
            db.session.delete(id_to_delete)
            db.session.commit()

def handle_perk_points_submission(char,perkCheckboxes):
        checked_count = sum(1 for field in perkCheckboxes.perk_points if field.data)
        char.perk_points = checked_count

def handle_perk_form_submission(form, char, char_unlocked_perks):
    #loop through the form list and determin whether a perk needs to be added, removed, or times_unlocked needs to be incremented
    for checkbox in form:
        perk_is_unlocked = next((perk for perk in char_unlocked_perks if perk[0] == checkbox.name), None)
        was_checked = next((perk for perk in char_unlocked_perks if perk[0] == checkbox.label.text), None) if not checkbox.data else None
        unlocked_character_perk = get_char_perk_record(char.name,checkbox.label.text)
        box_is_checked = checkbox.data

        if box_is_checked and not perk_is_unlocked:
            unlock_perk(checkbox, unlocked_character_perk, char)
        elif was_checked and unlocked_character_perk:
            remove_perk(checkbox, unlocked_character_perk)

def handle_char_stats_submission(char,charStats):
        char.gold = charStats.gold.data
        if charStats.char_notes.data:
            new_note = Notes(text=charStats.char_notes.data, character_id=char.id)
            db.session.add(new_note)
        # can't update xp data if it was decreased
        if charStats.xp.data >= char.xp:
            char.xp = charStats.xp.data

def active_perk_checker(class_perks_detail, unlocked_perks_detail):
    """
    Returns a dictionary indicating checkbox states for each class perk,
    based on whether the character has unlocked it, and amount of times it has been unlocked. 
    This will be used by the wrapper function to generate the boxex.
    """
    checkbox_states = {}

    for class_perk_name, _ in class_perks_detail:
        matched_unlocked = next(
            (unlocked for unlocked in unlocked_perks_detail if unlocked[0] == class_perk_name),
            None
        )

        if matched_unlocked:
            checkbox_states[class_perk_name] = {
                'checked': 'checked',
                'times_unlocked': matched_unlocked[1]
            }
        else:
            checkbox_states[class_perk_name] = {
                'checked': None,
                'times_unlocked': 0
            }

    return checkbox_states

def get_char_perk_record(character_name,perk_name):
    """
    join the character and perk tables, and return the matched index based on character name and perk name
    """
    char_perk = db.session.scalars(
    sa.select(Character_Perk)
        .join(Character_Perk.character)
        .join(Character_Perk.perk)
        .where(Character.name == character_name, Perk.name == perk_name)
    ).first()
    
    return char_perk

def remove_perk(checkbox, unlocked_perk_name):
    """
    either decrement times_unlocked, or delete the perk based on which box has been unchecked
    """
    if '_2' in checkbox.name:
        unlocked_perk_name.times_unlocked = 1
    else:
        db.session.delete(unlocked_perk_name)

def unlock_perk(checkbox, existing_perk, character):
    """
    Either increment times unlocked if perk has two checkboxes, and both are checked, 
    or add the perk to the char_perk table if only the second box was checked. 
    Otherwise, for a single checkbox or first checkbox only,  add perk to char_perk table
    """
    perk_name = checkbox.label.text
    perk = db.first_or_404(sa.select(Perk).where(Perk.name == perk_name))
    is_second_unlocked = '_2' in checkbox.name

    if is_second_unlocked:
        if existing_perk:        
            existing_perk.times_unlocked = 2 #increment times_unlocked to 2 if the perk already exists in the char_perk table (both checkboxes checked)
        else:
            add_character_perk(character,perk,1) #if the user checked the second checkbox, and the first is unchecked, instead, add the perk to the char_perk table. Upon reload, first checkbox is checked
    else:  
        add_character_perk(character,perk,1)

def add_character_perk(character,perk,times_unlocked):
    """
    Unlock the perk. Add it to the char_perk table.
    """    
    new_char_perk = Character_Perk(
        character=character,
        perk=perk,
        times_unlocked=times_unlocked
    )
    db.session.add(new_char_perk)

def SetCharacterLevel(xp,char):
    """
    Calculate level based on XP
    """
    level_thresholds = [(500, 9), (420, 8), (345, 7), (275, 6), (210, 5), (150, 4), (95, 3), (45, 2)]
    for threshold, level in level_thresholds:
        if xp >= threshold:
            char.level = level
            break
    else:
        char.level = 1 

def SetPartyShopModifier(partyRep):
    """
    Calculate shop modifier based on party reputation
    """
    sign = math.copysign(1, partyRep)
    reputation_abs = abs(partyRep)

    shop_thresholds = [(-5, 19), (-4, 15), (-3, 11), (-2, 7), (-1, 3), (0, 0)]
    for mod, reputation in shop_thresholds:
        if reputation_abs >= reputation:
            modifier = mod * sign
            return (int(modifier))

def CreatePerkCheckboxes(char):
    form = PerkPointCheckboxes(request.form if request.method == 'POST' else None)
    
    if request.method == 'GET':
        for i in range(18):
            form.perk_points[i].data = (i < char.perk_points)

    return form
