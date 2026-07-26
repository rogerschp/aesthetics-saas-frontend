import { api } from "@/shared/lib/api/client";
import type { Plan } from "@/shared/lib/api/types";

export const plansService = {
  /** GET /plans — público. Catálogo ativo com features. */
  list: async (): Promise<Plan[]> => {
    return api.get(`/plans`);
  },
};
