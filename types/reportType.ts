export type ReportTargetType = "post" | "comment" | "user";

export interface ReportTarget {
  id: string;
  type: ReportTargetType;
}
export type ReasonItem = { key: string; label: string };