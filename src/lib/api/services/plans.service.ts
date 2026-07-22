import { api } from "../client";
import type { Plan } from "../types";

export const plansService = {
  /** GET /plans — público. Catálogo ativo com features. */
  list: async (): Promise<Plan[]> => {
    const response = await api.get(`/plans`);
    return response as any;
  },
};
