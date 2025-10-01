// 📁 frontend/internal/src/pages/admin/AdminRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./AdminLayout";
import DashboardAdmin from "./DashboardAdmin";
import AdminEmployes from "./Employes";
import UserList from "./UserList";
import AdminPermissionsPage from "./AdminPermissionsPage";
import ScanUsersTool from "./tools/ScanUsers";

const AdminRoutes: React.FC = () => (
  <Routes>
    {/* AdminLayout est monté sur /admin/* depuis App.js */}
    <Route path="" element={<AdminLayout />}>
      {/* /admin → redirige vers /admin/dashboard */}
      <Route index element={<Navigate to="dashboard" replace />} />

      {/* /admin/dashboard */}
      <Route path="dashboard" element={<DashboardAdmin />} />

      {/* /admin/employes */}
      <Route path="employes" element={<AdminEmployes />} />

      {/* /admin/users */}
      <Route path="users" element={<UserList />} />

      {/* /admin/permissions */}
      <Route path="permissions" element={<AdminPermissionsPage />} />

      {/* /admin/tools/scan */}
      <Route path="tools/scan" element={<ScanUsersTool />} />

    </Route>
  </Routes>
);

export default AdminRoutes;

