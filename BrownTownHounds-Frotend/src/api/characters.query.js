import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export const qk = {
    characters: () => ['characters'],
    character: (id) => ['characters', id],
    characterNotes: (id) => ['characters', id, 'notes'],
    characterNote: (id,note_id) => ['characters', id, 'notes', note_id],
};

//Read: Get list of characters
export function useCharacters() {
    return useQuery({
        queryKey: qk.characters(),
        queryFn: api.listCharacters,
        staleTime: 1000 * 30,
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