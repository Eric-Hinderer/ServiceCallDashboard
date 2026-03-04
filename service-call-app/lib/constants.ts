import { Circle, Clock, CheckCircle, LucideIcon } from "lucide-react";

export const TECHNICIANS = [
  "Kurt",
  "Chris",
  "Mike",
  "Dean",
  "Damon",
  "John",
  "Aaron",
] as const;

export const UNASSIGNED_VALUE = "Select...";

export interface StatusOption {
  value: string;
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
  icon: LucideIcon;
}

export const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "OPEN",
    label: "Open",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    dotColor: "bg-red-500",
    icon: Circle,
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    dotColor: "bg-yellow-500",
    icon: Clock,
  },
  {
    value: "DONE",
    label: "Done",
    color: "text-green-700",
    bgColor: "bg-green-100",
    dotColor: "bg-green-500",
    icon: CheckCircle,
  },
];

export const TIMEZONE = "America/Chicago";

export const AFTER_HOURS_START = 17;
export const AFTER_HOURS_END = 8;

export const FIRESTORE_COLLECTION = "ServiceCalls";
