// Wipe every user-scoped Zustand store back to its initial state.
//
// Called from App.tsx whenever the auth user changes (sign-out OR sign-in
// as a different user without a refresh). Without this, the next user
// would see the previous user's clients/programs/etc. flash on screen
// because each store's `initializeFromDB` early-returns when `isLoaded`
// is true.
//
// Localstorage caches are user-id-keyed (storeCache.ts + planStore), so
// we only need to clear in-memory state here.

import { useClientStore }              from './clientStore';
import { useProgramStore }             from './programStore';
import { useExerciseStore }            from './exerciseStore';
import { useTemplateStore }            from './templateStore';
import { useFoodStore }                from './foodStore';
import { useDietPlanStore }            from './dietPlanStore';
import { useDietLogStore }             from './dietLogStore';
import { useClientActivityStore }      from './clientActivityStore';
import { useClientCheckInStore }       from './clientCheckInStore';
import { useClientProgressPhotoStore } from './clientProgressPhotoStore';
import { useClientSessionLogStore }    from './clientSessionLogStore';
import { usePaymentProofStore }        from './paymentProofStore';

export function resetUserStores(): void {
  useClientStore.setState({ clients: [], isLoaded: false, searchTerm: '' });
  useProgramStore.setState({ programs: [], isLoaded: false, draft: null });
  useExerciseStore.setState({ exercises: [], isLoaded: false, isInitializing: false, selectedTag: null });
  useTemplateStore.setState({ templates: [], isLoaded: false });
  useFoodStore.setState({ foods: [], isLoaded: false });
  useDietPlanStore.setState({ plans: [], isLoaded: false, draft: null });
  useDietLogStore.setState({ logs: [], isLoaded: false });
  useClientActivityStore.setState({ recentClientIds: new Set(), isLoaded: false });
  useClientCheckInStore.setState({ checkIns: [], isLoaded: false });
  useClientProgressPhotoStore.setState({ photos: [], isLoaded: false });
  useClientSessionLogStore.setState({ logs: [], isLoaded: false });
  usePaymentProofStore.setState({ myProofs: [], isLoaded: false });
}
