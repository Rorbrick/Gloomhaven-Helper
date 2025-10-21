import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export const queryKey = {
    classes: () => ['classes'],
    class: (id) => ['classes', id],
}

