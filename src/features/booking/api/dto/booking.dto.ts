export interface BookingSlotDraftDto {
  serviceId: string;
  date: string; // yyyy-MM-dd
  startTime: string; // HH:mm
}

export interface GuestBookingDraftDto extends BookingSlotDraftDto {
  guestName: string;
  guestPhone: string;
  guestEmail?: string | null;
}

/** XOR ops: clientUserId OU (guestName+guestPhone) OU nenhum (fallback logado). */
export interface OpsBookingDraftDto extends BookingSlotDraftDto {
  clientUserId?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string | null;
}
