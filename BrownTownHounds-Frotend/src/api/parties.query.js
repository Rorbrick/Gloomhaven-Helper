import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export const qk = {
    parties: () => ['parties'],
    party: (id) => ['parties', id],
    partyNotes: (id) => ['parties', id, 'notes'],
    partyNote: (id,note_id) => ['parties', id, 'notes', note_id],
    partyAchievements: (id) => ['parties', id, 'achievements']
}


//Read: Get list of parties
export function useParties() {
    return useQuery({
        queryKey: qk.parties(),
        queryFn: api.listParties,
    });
}


//read: Get single party
export function useParty(id, enabled = true){
    return useQuery({
        queryKey: qk.party(id),
        queryFn: () => api.getParty(id),
        enabled: !!id && enabled,
        staleTime: 1000 * 30,
    })
}


//read: Get party notes
export function usePartyNotes(id, enabled = true){
    return useQuery({
        queryKey: qk.partyNotes(),
        queryFn: () => api.listPartyNotes(id),
        enabled: !!id && enabled,
    })
}


//read: Get party achievements
export function usePartyAchievements(id, enabled = true){
    return useQuery({
        queryKey: qk.partyAchievements(),
        queryFn: () => api.listPartyAchievements(id),
        enabled: !!id && enabled,
    })
}



//write: create a new party
export function useCreateParty(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createParty,
        onMutate: async (newParty) => {
            //cancel in flight refetches
            await queryClient.cancelQueries({ queryKey: qk.parties() })

            //snapshot of previous party list
            const previousParties = queryClient.getQueryData(qk.parties())

            queryClient.setQueryData(qk.parties(), (old = []) => [
            ...old,
            { id: `temp-${Date.now()}`, ...newParty, _optimistic: true },
            ]);

            return { previousParties }
        },
        // If the mutation fails, use previous context stored for rollback
        onError: (err, newParty, context) => {
            queryClient.setQueryData([qk.parties(), context.previousParties])
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: qk.parties() })
        }
    })
}


//write: update party data
export function useUpdateParty(partyId){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (partyData) => api.updateParty(partyId, partyData),
        onMutate: async (partyData) => {
            await queryClient.cancelQueries({ queryKey: qk.party(partyId) })

            const previousPartyData = queryClient.getQueryData( qk.party(partyId) )

            queryClient.setQueryData(qk.party(partyId), (old = {}) => ({
                ...old,
                ...partyData,
            }));

            queryClient.setQueryData(qk.parties(), (old = []) => 
                old.map(o => (o.id === partyId ? {...o, ...partyData} : o))
            );           

            return (previousPartyData)
        },
        onError: (err, newPartyData, context) => {
            queryClient.setQueryData({ queryKey: context.previousPartyData })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: qk.party(partyId) })
            queryClient.invalidateQueries({ queryKey: qk.parties() })
        }
    })
}


//write: delete party
export function useDeleteParty(partyId){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => api.deleteParty(partyId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: qk.parties() });

            const previousParties = queryClient.getQueryData({ queryKey: qk.parties() })

            queryClient.setQueryData(qk.parties, (old = []) => {
                old?.filter(o => o.id !== partyId)
            });

            return(previousParties)
        },
        onError: (err, newPartyList, context) => {
            queryClient.setQueryData({ queryKey: context.previousParties })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: qk.parties() })
        }
    })
}


//write: delete party note
export function useDeletePartyNote(partyId){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (note_id) => api.deletePartyNote(partyId, note_id),
        onMutate: async (note_id) => {
            await queryClient.cancelQueries({ queryKey: qk.partyNotes() });

            const previousPartyNotes = queryClient.getQueryData({ querykey: qk.partyNotes() });

            queryClient.setQueryData(qk.partyNotes, (old = []) => {
                old?.filter(o => o.id !== note_id)
            });

            return(previousPartyNotes)
        },
        onError: (err, newPartyNotes, context) => {
            queryClient.setQueryData({ queryKey: context.previousPartyNotes });
        },
        onSettled: () =>{
            queryClient.invalidateQueries({ queryKey: qk.partyNotes() });
        }
    })
}

//write: create a new party note
export function useCreatePartyNote(partyId){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newNote) => api.createPartyNote(partyId, newNote),
        onMutate: async (newNote) => {
            await queryClient.cancelQueries({ queryKey: qk.partyNotes() })

            const previousPartyNotes = queryClient.getQueryData( qk.partyNotes())

            queryClient.setQueryData(qk.partyNotes(), (old = []) => [
            ...old,
            { party_id: partyId, id:`temp-${Date.now()}`, ...newNote, _optimistic: true }
            ]);

            return { previousPartyNotes }
        },
        onError: (err, newPartyNote, context) => {
            queryClient.setQueryData(qk.partyNotes(), context.previousPartyNotes);
        },       
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: qk.partyNotes() });
        },
    })
}


//write: create party achievement
export function useCreatePartyAchievement(partyId){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newAchievement) => api.createPartyAchievement(partyId, newAchievement),
        onMutate: async (newAchievement) => {
            await queryClient.cancelQueries({ queryKey: qk.partyAchievements() });

            const previousPartyAchievements = queryClient.getQueryData(qk.partyAchievements() );

            queryClient.setQueryData(qk.partyAchievements(), (old = []) => [
                ...old,
                { party_id: partyId, id: `temp-${Date.now()}`, ...newAchievement, _optimistic: true  }
            ]);
            
            return(previousPartyAchievements)
        },
        onError: (err, newPartyAchievement, context) => {
            queryClient.setQueryData(qk.partyAchievements, context.previousPartyAchievements);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: qk.partyAchievements() })
        }
    })
}