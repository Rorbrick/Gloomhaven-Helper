import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export const queryKey = {
    parties: () => ['parties'],
    party: (id) => ['parties', id],
    partyNotes: (id) => ['parties', id, 'notes'],
    partyNote: (id,note_id) => ['parties', id, 'notes', note_id],
}

