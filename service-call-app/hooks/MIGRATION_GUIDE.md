# Migration Guide: Converting to Custom Hooks

This guide shows how to migrate existing components from direct Firebase calls to using the custom hooks.

## Before and After Comparison

### 1. Real-time Data Fetching

**Before (Direct Firebase):**
```typescript
const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const q = query(
    collection(db, "ServiceCalls"),
    where("status", "in", [ServiceCallStatus.OPEN, ServiceCallStatus.IN_PROGRESS]),
    orderBy("date", "desc")
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const updatedServiceCalls = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date ? doc.data().date.toDate() : null,
      // ... more transformation
    })) as ServiceCall[];
    setServiceCalls(updatedServiceCalls);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);
```

**After (Custom Hook):**
```typescript
import { useOpenServiceCalls } from '@/hooks';

const { serviceCalls, loading, error } = useOpenServiceCalls();
```

### 2. Analytics Data Fetching

**Before (Multiple Server Actions):**
```typescript
const [weekendData, setWeekendData] = useState<WeekendData | undefined>();
const [callsPerLocation, setCallsPerLocation] = useState<{[key: string]: number}>({});
// ... more state

useEffect(() => {
  async function fetchData() {
    if (!startDate || !endDate) return;
    try {
      const weekendResult = await getWeekendServiceCalls(startDate, endDate);
      setWeekendData(weekendResult);
      
      const temp = await getCallsPerLocation(startDate, endDate);
      setCallsPerLocation(temp);
      // ... more API calls
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  fetchData();
}, [startDate, endDate]);
```

**After (Single Hook):**
```typescript
import { useAnalyticsData } from '@/hooks';

const {
  weekendData,
  callsPerLocation,
  callsPerTakenBy,
  callsPerMachine,
  loading,
  error,
  refetch
} = useAnalyticsData({
  startDate,
  endDate,
  autoFetch: true
});
```

### 3. Data Mutations

**Before (Manual Firebase Operations):**
```typescript
const [isPending, startTransition] = useTransition();

const updateStatus = (id: string, status: ServiceCallStatus) => {
  startTransition(async () => {
    try {
      const serviceCallRef = doc(db, "ServiceCalls", id);
      await updateDoc(serviceCallRef, {
        status,
        updatedAt: Timestamp.now(),
      });
      // Handle success
    } catch (error) {
      // Handle error
    }
  });
};
```

**After (Custom Hook):**
```typescript
import { useServiceCallMutations } from '@/hooks';

const { updateStatus, isPending, error } = useServiceCallMutations();

const handleStatusUpdate = async (id: string, status: ServiceCallStatus) => {
  const success = await updateStatus(id, status);
  if (success) {
    toast.success('Status updated successfully');
  }
};
```

## Step-by-Step Migration Process

### Step 1: Install and Import Hooks
```typescript
// Add to your component
import { 
  useServiceCalls, 
  useLocationsAndMachines, 
  useServiceCallMutations 
} from '@/hooks';
```

### Step 2: Replace State Declarations
```typescript
// Remove these
const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
const [loading, setLoading] = useState(true);
const [locations, setLocations] = useState<string[]>([]);

// Replace with
const { serviceCalls, loading, error } = useServiceCalls({ realTime: true });
const { locations, machines } = useLocationsAndMachines();
```

### Step 3: Remove useEffect Hooks
```typescript
// Remove Firebase useEffect hooks
useEffect(() => {
  // Firebase query setup
  // onSnapshot subscriptions
  // Manual data transformation
}, [dependencies]);

// The custom hooks handle this automatically
```

### Step 4: Update Error Handling
```typescript
// Add error handling for hooks
if (error) {
  return <div>Error: {error}</div>;
}

if (loading) {
  return <div>Loading...</div>;
}
```

### Step 5: Update Mutation Operations
```typescript
// Replace manual Firebase operations
const { 
  updateServiceCall, 
  createServiceCall, 
  deleteServiceCall,
  isPending 
} = useServiceCallMutations();

// Use in event handlers
const handleUpdate = async (id: string, data: Partial<ServiceCall>) => {
  const success = await updateServiceCall(id, data);
  if (success) {
    // Handle success
  }
};
```

## Benefits After Migration

### 1. **Reduced Boilerplate**
- 70% less code in components
- No manual state management
- No manual error handling setup

### 2. **Better Error Handling**
- Consistent error states across components
- Automatic retry mechanisms
- Centralized error logging

### 3. **Improved Performance**
- Automatic request deduplication
- Built-in caching strategies
- Optimized re-renders

### 4. **Enhanced Developer Experience**
- Type-safe operations
- IntelliSense support
- Consistent APIs across components

### 5. **Easier Testing**
- Mockable hook interfaces
- Isolated business logic
- Predictable state updates

## Component Files to Migrate

Here are the key files that should be migrated:

1. **`app/(Real Time Data)/RealTimeOpen.tsx`**
   - Use `useOpenServiceCalls()`
   - Use `useLocationsAndMachines()`

2. **`app/analytics/page.tsx`**
   - Use `useAnalyticsData()`
   - Simplify chart data binding

3. **`app/testing/data-table.tsx`**
   - Use `useAllServiceCallsRealTime()`
   - Remove manual Firebase subscriptions

4. **`components/TakenBy.tsx`**
   - Use `useServiceCallMutations()`
   - Replace manual updateDoc calls

5. **`components/Status.tsx`**
   - Use `useServiceCallMutations()`
   - Add optimistic updates

## Migration Checklist

- [ ] Install custom hooks in components
- [ ] Replace useState declarations
- [ ] Remove useEffect hooks for data fetching
- [ ] Update error handling patterns
- [ ] Replace manual Firebase operations
- [ ] Test real-time updates
- [ ] Verify error states
- [ ] Test loading states
- [ ] Update TypeScript types if needed
- [ ] Remove unused imports

## Testing the Migration

1. **Functionality Testing**
   - Verify all data loads correctly
   - Test real-time updates
   - Check error scenarios

2. **Performance Testing**
   - Monitor re-render frequency
   - Check network request efficiency
   - Verify memory usage

3. **User Experience Testing**
   - Test loading states
   - Verify error messages
   - Check responsive behavior

The migration to custom hooks will significantly improve code maintainability, reduce bugs, and enhance the developer experience while maintaining all existing functionality.
