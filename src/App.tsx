import { useEffect, useRef, lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import NotFoundPage from './components/layout/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import ClientProtectedRoute from './components/ClientProtectedRoute';
import { useAuthStore } from './store/authStore';
import { useSettingsStore } from './store/settingsStore';
import { useTemplateStore } from './store/templateStore';
import { usePlanStore } from './store/planStore';
import { useUserStore } from './store/userStore';
import { useClientStore } from './store/clientStore';
import { useProgramStore } from './store/programStore';
import { useClientPortalStore } from './store/clientPortalStore';
import { resetUserStores } from './store/resetUserStores';
import ErrorBoundary from './components/ErrorBoundary';

const LoginPage           = lazy(() => import('./pages/LoginPage'));
const SignupPage          = lazy(() => import('./pages/SignupPage'));
const OnboardingPage      = lazy(() => import('./pages/OnboardingPage'));
const ResetPasswordPage   = lazy(() => import('./pages/ResetPasswordPage'));
const PricingPage         = lazy(() => import('./pages/PricingPage'));
const PrivacyPage         = lazy(() => import('./pages/PrivacyPage'));
const TermsPage           = lazy(() => import('./pages/TermsPage'));
const DashboardPage       = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const ExercisesPage       = lazy(() => import('./features/exercises/pages/ExercisesPage'));
const ClientsPage         = lazy(() => import('./features/clients/pages/ClientsPage'));
const ClientProfilePage   = lazy(() => import('./features/clients/pages/ClientProfilePage'));
const ProgramsPage        = lazy(() => import('./features/programs/pages/ProgramsPage'));
const ProgramBuilderPage  = lazy(() => import('./features/programs/pages/ProgramBuilderPage'));
const ProgramPreviewPage  = lazy(() => import('./features/programs/pages/ProgramPreviewPage'));
const TemplatesPage       = lazy(() => import('./features/templates/pages/TemplatesPage'));
const TemplateEditorPage  = lazy(() => import('./features/templates/pages/TemplateEditorPage'));
const ConfigPage          = lazy(() => import('./features/config/pages/ConfigPage'));
const HelpPage            = lazy(() => import('./features/help/pages/HelpPage'));
const AdminPage           = lazy(() => import('./features/admin/pages/AdminPage'));
const FoodLibraryPage     = lazy(() => import('./features/diet/pages/FoodLibraryPage'));
const DietPlansPage       = lazy(() => import('./features/diet/pages/DietPlansPage'));
const DietPlanBuilderPage = lazy(() => import('./features/diet/pages/DietPlanBuilderPage'));
const ClientHomePage      = lazy(() => import('./features/clientPortal/pages/ClientHomePage'));
const RolePickerPage      = lazy(() => import('./pages/RolePickerPage'));

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/pricing', element: <PricingPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '/terms', element: <TermsPage /> },
  {
    path: '/client',
    element: (
      <ClientProtectedRoute>
        <ClientHomePage />
      </ClientProtectedRoute>
    ),
  },
  {
    path: '/choose-role',
    element: (
      <ProtectedRoute requireDualRole>
        <RolePickerPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'exercises', element: <ExercisesPage /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'clients/:id', element: <ClientProfilePage /> },
      { path: 'programs', element: <ProgramsPage /> },
      { path: 'programs/new', element: <ProgramBuilderPage /> },
      { path: 'programs/:id/edit', element: <ProgramBuilderPage /> },
      { path: 'programs/:id/preview', element: <ProgramPreviewPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'templates/:id/edit', element: <TemplateEditorPage /> },
      { path: 'config', element: <ConfigPage /> },
      { path: 'food-library', element: <FoodLibraryPage /> },
      { path: 'diet-plans', element: <DietPlansPage /> },
      { path: 'diet-plans/new', element: <DietPlanBuilderPage /> },
      { path: 'diet-plans/:id/edit', element: <DietPlanBuilderPage /> },
      { path: 'help', element: <HelpPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
  const initializeSettings = useSettingsStore((s) => s.initializeFromDB);
  const initializeTemplates = useTemplateStore((s) => s.initializeFromDB);
  const fetchSubscription = usePlanStore((s) => s.fetchSubscription);
  const resetPlan = usePlanStore((s) => s.reset);
  const initializeUser = useUserStore((s) => s.initialize);
  const resetUser = useUserStore((s) => s.reset);
  const resetSettings = useSettingsStore((s) => s.reset);
  const initializeClients = useClientStore((s) => s.initializeFromDB);
  const initializePrograms = useProgramStore((s) => s.initializeFromDB);
  const resetPortal = useClientPortalStore((s) => s.reset);

  // Initialize auth once on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Reset every user-scoped store whenever the auth user changes — both on
  // sign-out (user → null) and when a different user signs in without a
  // page refresh (user.id changes). Without this, the next user sees the
  // previous user's clients/programs/etc. flash because every store's
  // `initializeFromDB` early-returns when `isLoaded === true`.
  const lastUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    const currentId = user?.id ?? null;
    const prevId = lastUserIdRef.current;
    if (prevId === currentId) return;
    lastUserIdRef.current = currentId;
    if (prevId !== null && currentId !== prevId) {
      resetUser();
      resetPlan();
      resetSettings();
      resetPortal();
      resetUserStores();
    }
  }, [user, resetUser, resetPlan, resetSettings, resetPortal]);

  // Critical stores first (needed by ProtectedRoute + layout)
  useEffect(() => {
    if (!user) return;
    initializeSettings();
    initializeUser();
    fetchSubscription();
  }, [user, initializeSettings, initializeUser, fetchSubscription]);

  // Secondary stores + seed deferred so they don't block first paint.
  // seedDatabase is lazy-imported so the huge (1700+ line) seed data
  // chunk is never shipped in the main bundle.
  useEffect(() => {
    if (!user) return;
    const id = setTimeout(() => {
      initializeTemplates();
      initializeClients();
      initializePrograms();
      import('./db/seed').then(({ seedDatabase }) =>
        seedDatabase().catch((err) => console.error('[seed] Failed:', err))
      );
    }, 0);
    return () => clearTimeout(id);
  }, [user, initializeTemplates, initializeClients, initializePrograms]);

  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  );
}
