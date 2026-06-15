import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import MapOverview from "@/pages/MapOverview";
import ToiletDetail from "@/pages/ToiletDetail";
import ToiletManagement from "@/pages/ToiletManagement";
import Inspection from "@/pages/Inspection";
import InspectionTasks from "@/pages/InspectionTasks";
import WorkOrders from "@/pages/WorkOrders";
import CitizenReview from "@/pages/CitizenReview";
import Schedule from "@/pages/Schedule";
import Supplies from "@/pages/Supplies";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapOverview />} />
          <Route path="/toilet/:id" element={<ToiletDetail />} />
          <Route path="/management" element={<ToiletManagement />} />
          <Route path="/inspection-tasks" element={<InspectionTasks />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/work-orders" element={<WorkOrders />} />
          <Route path="/citizen" element={<CitizenReview />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/supplies" element={<Supplies />} />
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-2xl font-semibold mb-2">404</p>
                <p className="text-sm">页面不存在</p>
              </div>
            }
          />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
