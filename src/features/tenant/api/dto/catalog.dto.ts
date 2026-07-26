export interface CreateServiceDto {
  name: string;
  description?: string;
  price: number;
  durationInMinutes: number;
  isActive?: boolean;
}

export type UpdateServiceDto = Partial<CreateServiceDto>;
