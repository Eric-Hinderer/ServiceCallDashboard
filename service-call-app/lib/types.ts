import { ColumnDef, Table } from "@tanstack/react-table";
import { User } from "firebase/auth";
import { ReactNode } from "react";
import { Circle, Clock, CheckCircle } from "lucide-react";

// Service Call Types
export interface ServiceCall {
  id: string;
  date: Date;
  location: string;
  whoCalled: string;
  machine: string;
  reportedProblem: string;
  takenBy: string;
  notes: string;
  status: ServiceCallStatus;
  updatedAt: Date;
  createdAt?: Date;
  overDue?: boolean;
}

export enum ServiceCallStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS", 
  DONE = "DONE",
}

// Analytics Types
export interface DayData {
  dayOfWeek: number;
  callCount: number;
  serviceCalls: any[];
}

export interface WeekendData {
  count: number;
  serviceCalls: ServiceCall[];
}

export interface CallsByDay {
  callCount: number;
  serviceCalls: any[];
}

// UI Component Types
export interface DataTableProps<T = any> {
  columns: ColumnDef<T, any>[];
  data: T[];
}

export interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export interface DataTableColumnHeaderProps<TData, TValue> 
  extends React.HTMLAttributes<HTMLDivElement> {
  column: import("@tanstack/react-table").Column<TData, TValue>;
  title: string;
}

// Authentication Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}

// Chat Types
export interface ChatProps {
  children: ReactNode;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

// Form Types
export interface ServiceCallFormData {
  location: string;
  whoCalled: string;
  machine: string;
  reportedProblem: string;
  takenBy: string;
  notes: string;
  status: ServiceCallStatus;
}

// Constants
export const DAY_NAMES: { [key: number]: string } = {
  1: "Monday",
  2: "Tuesday", 
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
};

export const PREDEFINED_NAMES = [
  "Kurt", "Chris", "Mike", "Dean", "Damon", "John", "Aaron", "Select..."
];

export const STATUS_OPTIONS = [
  {
    value: ServiceCallStatus.OPEN,
    label: "Open",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: Circle,
  },
  {
    value: ServiceCallStatus.IN_PROGRESS,
    label: "In Progress", 
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: Clock,
  },
  {
    value: ServiceCallStatus.DONE,
    label: "Done",
    color: "text-green-700", 
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
];

export const PAGINATION_SIZES = [10, 20, 30, 40, 50];
