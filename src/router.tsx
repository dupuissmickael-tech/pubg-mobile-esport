import {lazy, Suspense} from 'react';
import {createBrowserRouter} from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';

// Every module (and its 3D scene) is code-split: visiting the home page
// never downloads scenes for modules the user hasn't opened yet.
const HomePage = lazy(() => import('@/pages/HomePage'));
const PriorityPage = lazy(() => import('@/pages/PriorityPage'));
const RolesPage = lazy(() => import('@/pages/RolesPage'));
const SplitPage = lazy(() => import('@/pages/SplitPage'));
const RotationsPage = lazy(() => import('@/pages/RotationsPage'));
const CompoundPage = lazy(() => import('@/pages/CompoundPage'));
const MicroMacroPage = lazy(() => import('@/pages/MicroMacroPage'));
const PlaneLinePage = lazy(() => import('@/pages/PlaneLinePage'));
const MapsIndexPage = lazy(() => import('@/pages/MapsIndexPage'));
const MapDetailPage = lazy(() => import('@/pages/MapDetailPage'));
const ComingSoonPage = lazy(() => import('@/pages/ComingSoonPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>;
}

function PageFallback() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500/30 border-t-accent-400" />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {index: true, element: withSuspense(<HomePage />)},
      {path: 'priorite', element: withSuspense(<PriorityPage />)},
      {path: 'roles', element: withSuspense(<RolesPage />)},
      {path: 'split', element: withSuspense(<SplitPage />)},
      {path: 'rotations', element: withSuspense(<RotationsPage />)},
      {path: 'compound', element: withSuspense(<CompoundPage />)},
      {path: 'micro-macro', element: withSuspense(<MicroMacroPage />)},
      {path: 'ligne-avion', element: withSuspense(<PlaneLinePage />)},
      {path: 'cartes', element: withSuspense(<MapsIndexPage />)},
      {path: 'cartes/:slug', element: withSuspense(<MapDetailPage />)},
      {path: 'a-venir', element: withSuspense(<ComingSoonPage />)},
      {path: '*', element: withSuspense(<NotFoundPage />)}
    ]
  }
]);
