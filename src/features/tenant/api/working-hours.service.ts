import { api } from "@/shared/lib/api/client";

/**
 * Duplicado de `src/features/booking/model/availability.types.ts` +
 * `src/features/booking/api/availability.service.ts` (ADR-003: feature ↛ feature).
 * Mesmos endpoints/payloads — usado apenas pelo fluxo de criação/edição do
 * tenant (expediente do 1º profissional ativo).
 */
export enum TenantWorkingDayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export interface TenantWorkingHoursPeriod {
  id: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface TenantWorkingHours {
  id: string;
  dayOfWeek: TenantWorkingDayOfWeek;
  isActive: boolean;
  periods?: TenantWorkingHoursPeriod[];
}

export interface BootstrapWorkingWeekDto {
  closedDays?: string[];
  periods: Array<{
    startTime: string;
    endTime: string;
  }>;
  overwriteExisting?: boolean;
}

export interface FormDayHours {
  fechado: boolean;
  inicio: string;
  fim: string;
}

/** Ordem do formulário (Domingo → Sábado), igual ao HoursInputRepeater. */
export const FORM_DAYS_OF_WEEK: TenantWorkingDayOfWeek[] = [
  TenantWorkingDayOfWeek.SUNDAY,
  TenantWorkingDayOfWeek.MONDAY,
  TenantWorkingDayOfWeek.TUESDAY,
  TenantWorkingDayOfWeek.WEDNESDAY,
  TenantWorkingDayOfWeek.THURSDAY,
  TenantWorkingDayOfWeek.FRIDAY,
  TenantWorkingDayOfWeek.SATURDAY,
];

function toHHmm(value: string): string {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return "09:00";
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

export function defaultWeekHours(): FormDayHours[] {
  return FORM_DAYS_OF_WEEK.map(() => ({
    fechado: false,
    inicio: "09:00",
    fim: "18:00",
  }));
}

/** Converte GET working-hours → array de 7 dias do form. */
export function workingHoursToForm(
  list: TenantWorkingHours[],
): FormDayHours[] {
  const byDay = new Map(list.map((wh) => [wh.dayOfWeek, wh]));
  return FORM_DAYS_OF_WEEK.map((day) => {
    const wh = byDay.get(day);
    if (!wh || !wh.isActive) {
      return { fechado: true, inicio: "09:00", fim: "18:00" };
    }
    const period = wh.periods?.[0];
    return {
      fechado: false,
      inicio: toHHmm(period?.startTime ?? "09:00"),
      fim: toHHmm(period?.endTime ?? "18:00"),
    };
  });
}

export const tenantWorkingHoursService = {
  listWorkingHours: async (
    tenantId: string,
    tpId: string,
  ): Promise<TenantWorkingHours[]> => {
    return api.get(
      `/tenants/${tenantId}/tenant-professionals/${tpId}/working-hours`,
    );
  },

  bootstrapWeek: async (
    tenantId: string,
    tpId: string,
    payload: BootstrapWorkingWeekDto,
  ): Promise<unknown> => {
    return api.post(
      `/tenants/${tenantId}/tenant-professionals/${tpId}/working-hours/bootstrap-week`,
      payload,
    );
  },

  createWorkingHours: async (
    tenantId: string,
    tpId: string,
    payload: {
      dayOfWeek: TenantWorkingDayOfWeek;
      isActive?: boolean;
      periods?: Array<{ startTime: string; endTime: string }>;
    },
  ): Promise<TenantWorkingHours> => {
    return api.post(
      `/tenants/${tenantId}/tenant-professionals/${tpId}/working-hours`,
      payload,
    );
  },

  updateWorkingHours: async (
    tenantId: string,
    tpId: string,
    workingHoursId: string,
    payload: { isActive?: boolean; dayOfWeek?: TenantWorkingDayOfWeek },
  ): Promise<TenantWorkingHours> => {
    return api.patch(
      `/tenants/${tenantId}/tenant-professionals/${tpId}/working-hours/${workingHoursId}`,
      payload,
    );
  },

  createPeriod: async (
    tenantId: string,
    tpId: string,
    workingHoursId: string,
    payload: { startTime: string; endTime: string },
  ): Promise<unknown> => {
    return api.post(
      `/tenants/${tenantId}/tenant-professionals/${tpId}/working-hours/${workingHoursId}/periods`,
      payload,
    );
  },

  updatePeriod: async (
    tenantId: string,
    tpId: string,
    workingHoursId: string,
    periodId: string,
    payload: { startTime?: string; endTime?: string },
  ): Promise<unknown> => {
    return api.patch(
      `/tenants/${tenantId}/tenant-professionals/${tpId}/working-hours/${workingHoursId}/periods/${periodId}`,
      payload,
    );
  },

  /**
   * Sincroniza o formulário de expediente (7 dias) com a agenda do profissional.
   * Respeita horário diferente por dia (além de aberto/fechado).
   */
  syncWeekFromForm: async (
    tenantId: string,
    tpId: string,
    horarios: FormDayHours[],
  ): Promise<void> => {
    if (horarios.length !== 7) {
      throw new Error("Expediente deve ter 7 dias");
    }

    const existing = await tenantWorkingHoursService.listWorkingHours(
      tenantId,
      tpId,
    );
    const byDay = new Map(existing.map((wh) => [wh.dayOfWeek, wh]));

    for (let i = 0; i < 7; i++) {
      const day = FORM_DAYS_OF_WEEK[i];
      const h = horarios[i];
      const startTime = toHHmm(h.inicio);
      const endTime = toHHmm(h.fim);
      const current = byDay.get(day);

      if (!current) {
        await tenantWorkingHoursService.createWorkingHours(tenantId, tpId, {
          dayOfWeek: day,
          isActive: !h.fechado,
          periods: h.fechado ? undefined : [{ startTime, endTime }],
        });
        continue;
      }

      const periods = current.periods ?? [];

      if (h.fechado) {
        if (current.isActive) {
          await tenantWorkingHoursService.updateWorkingHours(
            tenantId,
            tpId,
            current.id,
            { isActive: false },
          );
        }
        continue;
      }

      // Aberto: garante período antes de ativar (regra do back).
      if (periods.length === 0) {
        await tenantWorkingHoursService.createPeriod(tenantId, tpId, current.id, {
          startTime,
          endTime,
        });
      } else {
        const first = periods[0];
        if (
          toHHmm(first.startTime) !== startTime ||
          toHHmm(first.endTime) !== endTime
        ) {
          await tenantWorkingHoursService.updatePeriod(
            tenantId,
            tpId,
            current.id,
            first.id,
            { startTime, endTime },
          );
        }
      }

      if (!current.isActive) {
        await tenantWorkingHoursService.updateWorkingHours(
          tenantId,
          tpId,
          current.id,
          { isActive: true },
        );
      }
    }
  },
};
