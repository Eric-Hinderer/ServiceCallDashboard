// Service Calls Hooks
export {
  useServiceCalls,
  useOpenServiceCalls,
  useAllServiceCallsRealTime,
  useServiceCallsByDateRange,
} from "./useServiceCalls";

// Locations and Machines Hooks
export {
  useLocations,
  useMachines,
  useLocationsAndMachines,
} from "./useLocationsAndMachines";

// Analytics Hooks
export {
  useAnalyticsData,
  useWeekendData,
  useAfterHoursData,
} from "./useAnalytics";

// Dashboard Hooks
export {
  useDashboardStats,
  useServiceCallFilters,
} from "./useDashboard";

// Mutation Hooks
export {
  useServiceCallMutations,
  useOptimisticUpdates,
} from "./useMutations";

// Generic Utility Hooks
export {
  useFetch,
  useAsync,
  useLocalStorage,
  useSessionStorage,
} from "./useGeneric";
