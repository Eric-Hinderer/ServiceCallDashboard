# Custom Data Fetching Hooks

This directory contains custom React hooks for data fetching and state management in the Service Call Dashboard application.

## Available Hooks

### Service Calls Hooks (`useServiceCalls.ts`)

#### `useServiceCalls(options)`
Generic hook for fetching service calls with flexible options.

```typescript
const { serviceCalls, loading, error, refetch } = useServiceCalls({
  realTime: true,
  status: [ServiceCallStatus.OPEN],
  orderByField: "date",
  orderDirection: "desc",
  startDate: new Date(),
  endDate: new Date()
});
```

#### `useOpenServiceCalls()`
Specialized hook for real-time open/in-progress service calls.

```typescript
const { serviceCalls, loading, error } = useOpenServiceCalls();
```

#### `useAllServiceCallsRealTime()`
Hook for all service calls with real-time updates.

```typescript
const { serviceCalls, loading, error } = useAllServiceCallsRealTime();
```

#### `useServiceCallsByDateRange(startDate, endDate)`
Hook for fetching service calls within a specific date range.

```typescript
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-01-31');
const { serviceCalls, loading, error } = useServiceCallsByDateRange(startDate, endDate);
```

### Locations and Machines Hooks (`useLocationsAndMachines.ts`)

#### `useLocations()`
Hook for fetching all locations.

```typescript
const { locations, loading, error, refetch } = useLocations();
```

#### `useMachines()`
Hook for fetching all machines.

```typescript
const { machines, loading, error, refetch } = useMachines();
```

#### `useLocationsAndMachines()`
Hook for fetching both locations and machines in parallel.

```typescript
const { locations, machines, loading, error, refetch } = useLocationsAndMachines();
```

### Analytics Hooks (`useAnalytics.ts`)

#### `useAnalyticsData(options)`
Comprehensive hook for all analytics data.

```typescript
const {
  weekendData,
  afterHoursCallsByDayOfWeek,
  callsPerLocation,
  callsPerTakenBy,
  callsPerMachine,
  loading,
  error,
  refetch
} = useAnalyticsData({
  startDate: new Date(),
  endDate: new Date(),
  autoFetch: true
});
```

#### `useWeekendData(startDate, endDate)`
Hook specifically for weekend service calls data.

```typescript
const { weekendData, loading, error, refetch } = useWeekendData(startDate, endDate);
```

#### `useAfterHoursData(startDate, endDate)`
Hook for after-hours service calls by day of week.

```typescript
const { afterHoursData, loading, error, refetch } = useAfterHoursData(startDate, endDate);
```

### Dashboard Hooks (`useDashboard.ts`)

#### `useDashboardStats(serviceCalls)`
Hook for calculating dashboard statistics from service calls data.

```typescript
const {
  totalServiceCalls,
  openServiceCalls,
  completedServiceCalls,
  resolvedToday,
  trend,
  loading
} = useDashboardStats(serviceCalls);
```

#### `useServiceCallFilters(serviceCalls)`
Hook for filtering service calls with various criteria.

```typescript
const {
  filteredServiceCalls,
  filters,
  setStatusFilter,
  setLocationFilter,
  setDateRangeFilter,
  clearFilters
} = useServiceCallFilters(serviceCalls);
```

### Mutation Hooks (`useMutations.ts`)

#### `useServiceCallMutations()`
Hook for performing CRUD operations on service calls.

```typescript
const {
  updateServiceCall,
  createServiceCall,
  deleteServiceCall,
  updateStatus,
  updateTakenBy,
  isPending,
  error
} = useServiceCallMutations();

// Usage
const success = await updateStatus(serviceCallId, ServiceCallStatus.DONE);
const newId = await createServiceCall(formData);
```

#### `useOptimisticUpdates(originalData)`
Hook for optimistic UI updates while mutations are pending.

```typescript
const {
  optimisticData,
  addOptimisticUpdate,
  removeOptimisticUpdate,
  clearOptimisticUpdates
} = useOptimisticUpdates(serviceCalls);
```

### Generic Utility Hooks (`useGeneric.ts`)

#### `useFetch<T>()`
Generic fetch hook for API calls.

```typescript
const { data, loading, error, execute, reset } = useFetch<ServiceCall[]>();

// Usage
await execute('/api/service-calls');
```

#### `useAsync<T>(asyncFunction)`
Hook for handling async operations.

```typescript
const { data, loading, error, execute } = useAsync(getServiceCalls);

// Usage
await execute();
```

#### `useLocalStorage<T>(key)`
Hook for localStorage management.

```typescript
const { value, setValue, removeValue } = useLocalStorage<string>('user-preference');
```

#### `useSessionStorage<T>(key)`
Hook for sessionStorage management.

```typescript
const { value, setValue, removeValue } = useSessionStorage<ServiceCall[]>('temp-data');
```

## Usage Examples

### Real-time Dashboard Component

```typescript
import { useOpenServiceCalls, useDashboardStats } from '@/hooks';

function Dashboard() {
  const { serviceCalls, loading, error } = useOpenServiceCalls();
  const stats = useDashboardStats(serviceCalls);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Open Calls: {stats.openServiceCalls}</p>
      <p>Completed Today: {stats.resolvedToday}</p>
    </div>
  );
}
```

### Analytics Page

```typescript
import { useAnalyticsData } from '@/hooks';
import { subDays } from 'date-fns';

function AnalyticsPage() {
  const startDate = subDays(new Date(), 30);
  const endDate = new Date();
  
  const {
    weekendData,
    callsPerLocation,
    loading,
    error,
    refetch
  } = useAnalyticsData({ startDate, endDate });

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Analytics</h1>
      <p>Weekend Calls: {weekendData?.count}</p>
      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
}
```

### Service Call Management

```typescript
import { useServiceCallMutations, useAllServiceCallsRealTime } from '@/hooks';

function ServiceCallManager() {
  const { serviceCalls } = useAllServiceCallsRealTime();
  const { updateStatus, isPending } = useServiceCallMutations();

  const handleStatusUpdate = async (id: string, status: ServiceCallStatus) => {
    const success = await updateStatus(id, status);
    if (success) {
      toast.success('Status updated successfully');
    }
  };

  return (
    <div>
      {serviceCalls.map(call => (
        <div key={call.id}>
          <p>{call.location} - {call.status}</p>
          <button 
            onClick={() => handleStatusUpdate(call.id, ServiceCallStatus.DONE)}
            disabled={isPending}
          >
            Mark as Done
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

1. **Error Handling**: Always check for errors and display appropriate messages
2. **Loading States**: Show loading indicators while data is being fetched
3. **Real-time vs Static**: Use real-time hooks only when necessary to avoid unnecessary re-renders
4. **Memoization**: Consider memoizing hook options to prevent unnecessary re-fetches
5. **Cleanup**: The hooks handle cleanup automatically, but be mindful of component unmounting

## Type Safety

All hooks are fully typed with TypeScript. Import the appropriate types from `@/lib/types`:

```typescript
import { ServiceCall, ServiceCallStatus, DayData, WeekendData } from '@/lib/types';
```
