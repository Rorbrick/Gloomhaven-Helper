from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from typing import Optional
import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db

class Class(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True,
                                                unique=True)
    class_perks: so.Mapped[list["Class_Perk"]] = so.relationship(back_populates="class_")
    characters: so.Mapped[list["Character"]] = so.relationship(back_populates='class_name')
    retired_characters: so.Mapped[list["RetiredCharacter"]] = so.relationship(back_populates='class_name')

    def __repr__(self):
        return '<Class {}>'.format(self.name)
    
class Perk(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True,
                                                unique=True)
    class_perks: so.Mapped[list["Class_Perk"]] = so.relationship(back_populates="perk")
    char_perk: so.Mapped[list["Character_Perk"]] = so.relationship(back_populates="perk")

    def __repr__(self):
        return '<Perk {}>'.format(self.name)
    
class Character(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True,
                                                unique=True)
    level: so.Mapped[int] = so.mapped_column(sa.Integer, index=True, default=1)
    xp: so.Mapped[int] = so.mapped_column(sa.Integer, index=True, default=0)
    gold: so.Mapped[int] = so.mapped_column(sa.Integer, index=True, default=0)
    perk_points: so.Mapped[int] = so.mapped_column(sa.Integer, index=True, default=0)
    class_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(Class.id),
                                               index=True)
    
    char_perk: so.Mapped[list["Character_Perk"]] = so.relationship(back_populates='character', cascade="all, delete-orphan")
    class_name: so.Mapped[Class] = so.relationship(back_populates='characters')
    notes: so.Mapped[list['Notes']] = so.relationship(back_populates='character', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Character name={self.name}, class_name={self.class_name}, class_id={self.class_id}, level={self.level}, xp={self.xp}, gold={self.gold}, perk_points={self.perk_points}, unlocked_perks={self.char_perk}>"
    
class Class_Perk(db.Model):
    __tablename__ = 'class_perk'
    class_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(Class.id), primary_key=True)
    perk_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(Perk.id), primary_key=True)
    times_unlockable: so.Mapped[int] = so.mapped_column(sa.Integer, index=True, default=1)
    
    class_: so.Mapped["Class"] = so.relationship(back_populates="class_perks")
    perk: so.Mapped["Perk"] = so.relationship(back_populates="class_perks")

    def __repr__(self):
        return f"<Class_Perk class_id={self.class_id}, perk_id={self.perk_id}>"
    
class Character_Perk(db.Model):
    __tablename__ = 'character_perk'
    character_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(Character.id), primary_key=True)
    perk_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(Perk.id), primary_key=True)
    times_unlocked: so.Mapped[int] = so.mapped_column(sa.Integer, index=True, default=0)

    character: so.Mapped[Character] = so.relationship(back_populates='char_perk')
    perk: so.Mapped[Perk] = so.relationship(back_populates='char_perk')

    def __repr__(self):
        return f"<Character_Perk character_id={self.character_id}, perk_id={self.perk_id}>, times_unlocked={self.times_unlocked}"
    
class Notes(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    character_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(Character.id), 
                                                index=True)
    text: so.Mapped[str] = so.mapped_column(sa.String(256))
    timestamp: so.Mapped[datetime] = so.mapped_column(
        index=True, default=lambda: datetime.now(timezone.utc))

    character: so.Mapped["Character"] = so.relationship(back_populates='notes')

    def __repr__(self):
        return f"<Comment character_id={self.character_id}, text={self.text}>"

class Cards(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    char_class: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    image_path: so.Mapped[str] = so.mapped_column(sa.String(64), index=True,
                                                unique=True)
    
    def __repr__(self):
        return f"<Cards name={self.name}, class={self.char_class}, image path={self.image_path}>"

class RetiredCharacter(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    level: so.Mapped[int] = so.mapped_column(sa.Integer, index=True, default=1)
    gold: so.Mapped[int] = so.mapped_column(sa.Integer, index=True, default=0)
    class_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(Class.id),index=True)
    
    class_name: so.Mapped[Class] = so.relationship(back_populates='retired_characters')

class Party(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True,
                                                unique=True)
    location: so.Mapped[str] = so.mapped_column(sa.String(64), index=True,
                                                unique=True, nullable=True)
    reputation: so.Mapped[int] = so.mapped_column(sa.Integer, index=True, default=0)

    notes: so.WriteOnlyMapped['PartyNotes'] = so.relationship(back_populates='party', cascade="all, delete", passive_deletes=True)
    achievements: so.WriteOnlyMapped['PartyAchievements'] = so.relationship(back_populates='party', cascade="all, delete", passive_deletes=True)

class PartyNotes(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    party_id: so.Mapped[str] = so.mapped_column(sa.ForeignKey(Party.id),
                                               index=True)
    text: so.Mapped[str] = so.mapped_column(sa.String(256))
    timestamp: so.Mapped[datetime] = so.mapped_column(
        index=True, default=lambda: datetime.now(timezone.utc))
    
    party: so.Mapped["Party"] = so.relationship(back_populates='notes')

class PartyAchievements(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    text: so.Mapped[str] = so.mapped_column(sa.String(256))
    party_id: so.Mapped[str] = so.mapped_column(sa.ForeignKey(Party.id),
                                               index=True)
    timestamp: so.Mapped[datetime] = so.mapped_column(
        index=True, default=lambda: datetime.now(timezone.utc))
    
    party: so.Mapped["Party"] = so.relationship(back_populates='achievements')