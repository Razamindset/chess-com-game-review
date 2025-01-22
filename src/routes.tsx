import { createBrowserRouter } from "react-router-dom";
import { HomePage, NotFoundPage, TestPage } from "./components/pages";
import { lazy, Suspense } from "react";
import Loader from "./components/loader";

const AnalysisPage = lazy(() => import("./components/pages/Analysis"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/testpage",
    element: <TestPage />,
  },
  {
    path: "/analysis",
    element: (
      <Suspense fallback={<Loader />}>
        <AnalysisPage />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
