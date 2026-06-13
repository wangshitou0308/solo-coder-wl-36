import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import MapOverview from "@/pages/MapOverview";
import ToiletDetail from "@/pages/ToiletDetail";
import ToiletManagement from "@/pages/ToiletManagement";
import Inspection from "@/pages/Inspection";
import CitizenReview from "@/pages/CitizenReview";
import Schedule from "@/pages/Schedule";
import Supplies from "@/pages/Supplies";

function LayoutWrapper() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

const router = createBrowserRouter([
  {
    element: <LayoutWrapper />,
    children: [
      { path: "/", element: <MapOverview /> },
      { path: "/toilet/:id", element: <ToiletDetail /> },
      { path: "/management", element: <ToiletManagement /> },
      { path: "/inspection", element: <Inspection /> },
      { path: "/citizen", element: <CitizenReview /> },
      { path: "/schedule", element: <Schedule /> },
      { path: "/supplies", element: <Supplies /> },
      {
        path: "*",
        element: (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-2xl font-semibold mb-2">404</p>
            <p className="text-sm">页面不存在</p>
          </div>
        ),
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
