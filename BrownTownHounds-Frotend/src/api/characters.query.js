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

export function useCreateCharacter(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createCharacter,

        onMutate: async (newCharacter) => {
            //cancel in flight refetches
            await queryClient.cancelQueries({ queryKey: qk.characters() })

            //snapshot of previous character list
            const previousCharacters = queryClient.getQueryData(qk.characters())

            queryClient.setQueryData(qk.characters(), (old) => [
            ...old,
            { id: `temp-${Date.now()}`, ...newCharacter, _optimistic: true },
            ]);

            return { previousCharacters }
        },
        // If the mutation fails, use previous context stored for rollback
        onError: (err, newCharacter, context) => {
            queryClient.setQueryData([qk.characters(), context.previousCharacters])
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: qk.characters })
        }
    })
}