from flask_wtf import FlaskForm
from wtforms import (
    StringField,
    PasswordField,
    BooleanField,
    SubmitField,
    SelectField,
    BooleanField,
    FieldList,
    FormField,
    Form,
    IntegerField,
)
from wtforms.validators import ValidationError, DataRequired, Email, EqualTo
import sqlalchemy as sa
from app import db
from app.models import Character


class RegistrationForm(FlaskForm):
    name = StringField("Character Name", validators=[DataRequired()])
    class_ = SelectField("Choose a Class", choices=[], validators=[DataRequired()])
    submit = SubmitField("Register")

    def validate_name(self, name):
        name = db.session.scalar(
            sa.select(Character).where(Character.name == name.data)
        )
        if name is not None:
            raise ValidationError("Please use a different character name.")


class PartyRegistrationForm(FlaskForm):
    name = StringField("Character Name", validators=[DataRequired()])
    submit = SubmitField("Register")


class PerkPointCheckboxes(FlaskForm):
    perk_points = FieldList(BooleanField(), min_entries=18, max_entries=18)


class CharacterDetailsForm(FlaskForm):
    xp = IntegerField("XP: ")
    gold = IntegerField("Gold: ")
    char_notes = StringField("")


class PartyForm(FlaskForm):
    loc = StringField("")
    achievement = StringField("")
    note = StringField("")
    reputation = IntegerField("")


def wrapper_func(perk_list, checked):  # pass in the perk list
    class PerkForm(Form):
        pass  # forming a class that doesn't yet have any data in it. we will dynamically assign it

    for perk in perk_list:
        setattr(
            PerkForm,
            str(perk[0]),
            BooleanField(label=perk[0], default=checked[perk[0]]["checked"]),
        )  # setting the booleanfield in the Perk_list class
        if perk[1] > 1:
            new_perk_name = str(perk[0]) + "_2"
            checked_, disabled = (
                ("checked", "enabled")
                if checked[perk[0]]["times_unlocked"] > 1
                else (None, "disabled")
            )

            setattr(
                PerkForm, new_perk_name, BooleanField(label=perk[0], default=checked_)
            )

    return PerkForm  # send back the dynamically created perk list
