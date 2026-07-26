export interface BootstrapWorkingWeekDto {
  closedDays?: string[];
  periods: Array<{
    startTime: string;
    endTime: string;
  }>;
  overwriteExisting?: boolean;
}
