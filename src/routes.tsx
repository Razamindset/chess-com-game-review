import { createBrowserRouter } from "react-router-dom";
import { AnalysisPage, HomePage, NotFoundPage } from "./components/pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/analysis",
    element: <AnalysisPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
