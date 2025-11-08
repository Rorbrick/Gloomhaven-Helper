import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export const qk = {
    characters: () => ['characters'],
    character: (id) => ['characters', id],
    characterNotes: (id) => ['characters', id, 'notes'],
    characterNote: (id,note_id) => ['characters', id, 'notes', note_id],
    characterPerks: (id) => ['characters', id, 'perks'],
    retiredCharacters: () => ['characters', 'retired']
};


//Read: Get list of characters
export function useCharacters() {
    return useQuery({
        queryKey: qk.characters(),
        queryFn: api.listCharacters,
    });
}


//read: Get single character
export function useCharacter(id, enabled = true){
    return useQuery({
        queryKey: qk.character(id),
        queryFn: () => api.getCharacter(id),
        enabled: !!id && enabled,
        staleTime: 1000 * 30,
    })
}


//read: Get a characters notes
export function useCharacterNotes(id, enabled = true){
    return useQuery({
        queryKey: qk.characterNotes(id),
        queryFn: () => api.listCharacterNotes(id),
        enabled: !!id && enabled,
    })
}

//read: Get character perks
export function useCharacterPerks(id){
    return useQuery({
        queryKey: qk.characterPerks(id),
        queryFn: () => api.listCharacterPerks(id),
    })
}

//read: Get retired characters
export function useRetiredCharacters(){
    return useQuery({
        queryKey: qk.retiredCharacters(),
        queryFn: () => api.listRetiredCharacters(),
    })
}

//write: create a new character
export function useCreateCharacter(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createCharacter,
        onMutate: async (newCharacter) => {
            //cancel in flight refetches
            await queryClient.cancelQueries({ queryKey: qk.characters() })

            //snapshot of previous character list
            const previousCharacters = queryClient.getQueryData(qk.characters());

            queryClient.setQueryData(qk.characters(), (old = []) => [
            ...old,
            { id: `temp-${Date.now()}`, ...newCharacter, _optimistic: true },
            ]);

            return { previousCharacters };
        },
        // If the mutation fails, use previous context stored for rollback
        onError: (err, newCharacter, context) => {
            queryClient.setQueryData(qk.characters(), context.previousCharacters);
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: qk.characters() });
        }
    })
}


//write: update character data
export function useUpdateCharacter(characterId){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (charData) => api.updateCharacter(characterId, charData),
        onMutate: async (charData) => {
            await queryClient.cancelQueries({ queryKey: qk.character(characterId) })

            const previousCharacterData = queryClient.getQueryData(qk.character(characterId));
            const previousCharacters = queryClient.getQueryData(qk.characters());

            //Update cached data for the individual key
            queryClient.setQueryData(qk.character(characterId), (old = {}) => ({
                ...old,
                ...charData,
            }));

            //Update cached data for the list
            queryClient.setQueryData(qk.characters(), (old = []) => 
                old.map(o => (o.id === characterId ? {...o, ...charData} : o))
            );           

            return { previousCharacterData, previousCharacters };
        },
        onError: (_err, _newCharData, ctx) => {
            if (ctx?.previousCharacterData) {
                queryClient.setQueryData(qk.character(characterId), ctx.previousCharacterData);
            }
            if (ctx?.previousCharacters) {
                queryClient.setQueryData(qk.characters(), ctx.previousCharacters);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: qk.character(characterId) })
        }
    })
}


//write: delete character
export function useDeleteCharacter(characterId){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => api.deleteCharacter(characterId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: qk.characters() });

            const previousCharacters = queryClient.getQueryData(qk.characters()); 

            queryClient.setQueryData(qk.characters(), (old = []) =>
                old.filter((o) => o.id !== characterId),
            );

            return { previousCharacters };
        },
        onError: (err, newCharacterList, context) => {
            queryClient.setQueryData(qk.characters(), context.previousCharacters);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: qk.characters() })
        }
    })
}


//write: delete character note
export function useDeleteCharacterNote(characterId){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (note_id) => api.deleteCharacterNote(characterId, note_id),
        onMutate: async (note_id) => {
            await queryClient.cancelQueries({ queryKey: qk.characterNotes(characterId) });

            const previousCharacterNotes = queryClient.getQueryData(qk.characterNotes(characterId));

            queryClient.setQueryData(qk.characterNotes(characterId) , (old = []) => {
                old?.filter(o => o.id !== note_id)
            });

            return { previousCharacterNotes };
        },
        onError: (err, newCharacterNotes, context) => {
            queryClient.setQueryData(qk.characterNotes(characterId), context.previousCharacterNotes);
        },
        onSettled: () =>{
            queryClient.invalidateQueries({ queryKey: qk.characterNotes(characterId) });
        }
    })
}

//write: create a new character note
export function useCreateCharacterNote(characterId){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newNote) => api.createCharacterNote(characterId, newNote),
        onMutate: async (newNote) => {
            await queryClient.cancelQueries({ queryKey: qk.characterNotes(characterId) });

            const previousCharacterNotes = queryClient.getQueryData(qk.characterNotes(characterId));

            queryClient.setQueryData(qk.characterNotes(characterId), (old = []) => [
            ...old,
            { id: characterId, note_id:`temp-${Date.now()}`, ...newNote, _optimistic: true }
            ]);

            return { previousCharacterNotes };
        },
        onError: (err, newCharacterNote, context) => {
            queryClient.setQueryData(qk.characterNotes(characterId), context.previousCharacterNotes);
        },       
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: qk.characterNotes(characterId) });
        },
    })
}

//write: update character perk
export function useUpdateCharacterPerk(characterId){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (perk) => api.updateCharacterPerk(characterId,perk),
        onMutate: async (perk) => {
            await queryClient.cancelQueries({ queryKey: qk.characterPerks(characterId) });

            const previousCharacterPerks = queryClient.getQueryData(qk.characterPerks(characterId));

            queryClient.setQueryData(qk.characterPerks(characterId), (old = []) =>
                old.map((o) => (o.perk_id === perk.perk_id ? { ...o, ...perk } : o)),
            );

            return { previousCharacterPerks };
        },
        onError: (err, newCharacterPerk, context) => {
            queryClient.setQueryData(qk.characterPerks(characterId), context.previousCharacterPerks)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: qk.characterPerks(characterId) })
        },
    })
}