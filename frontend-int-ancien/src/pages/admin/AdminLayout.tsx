// 📁 frontend/internal/src/pages/admin/AdminLayout.tsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Espace Admin</h2>
        <nav className="space-y-2">
          <NavLink
            to="dashboard"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`
            }
          >
            Tableau de bord
          </NavLink>

          <NavLink
            to="employes"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`
            }
          >
            Employés Flotteq
          </NavLink>

          <NavLink
            to="users"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`
            }
          >
            Utilisateurs
          </NavLink>

          <NavLink
            to="permissions"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`
            }
          >
            Permissions
          </NavLink>

          {/* Section Outils */}
          <div className="mt-4 border-t pt-4">
            <p className="uppercase text-xs font-semibold text-gray-500 mb-2">Outils</p>
            <NavLink
              to="tools/scan"
              className={({ isActive }) =>
                `block px-3 py-2 rounded ${
                  isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                }`
              }
            >
              Scan Routes
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

