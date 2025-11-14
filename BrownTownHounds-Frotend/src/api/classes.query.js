import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

export const qk = {
  classes: () => ["classes"],
  class: (id) => ["classes", id],
};

//Read: Get list of classes
export function useClasses() {
  return useQuery({
    queryKey: qk.classes(),
    queryFn: api.listClasses,
    staleTime: 1000 * 30,
  });
}

//read: Get single class
export function useClass(id, enabled = true) {
  return useQuery({
    queryKey: qk.class(id),
    queryFn: () => api.getClass(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 30,
  });
}
