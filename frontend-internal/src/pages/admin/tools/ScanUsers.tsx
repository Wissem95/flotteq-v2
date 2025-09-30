// 📁 clients/src/pages/admin/tools/ScanUsers.tsx
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const ScanUsersTool: React.FC = () => {
  const { user } = useAuth();

  // Autorise si
  //  - c'est un employé interne Flotteq (isInternal = true)
  //  - OU c'est un admin “classique” (role = "admin")
  const isFlotteqAdmin = user?.isInternal === true;
  const isTenantAdmin  = user?.role === "admin";

  if (!isFlotteqAdmin && !isTenantAdmin) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Accès refusé</h1>
        <p className="mb-4">
          Vous n’avez pas les droits pour accéder à cet outil.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔍 Outil de scan des anciennes routes utilisateurs</h1>
      <p className="mb-4 text-slate-600">
        Cet outil permet de détecter les anciens appels vers <code>/api/users</code> qui doivent être migrés vers <code>/api/auth/users</code>.
      </p>
      <Button
        onClick={() => {
          alert("🧪 Scan lancé ! (simulateur local)");
          // axios.get('/api/admin/scan-old-user-routes').then(...)
        }}
      >
        Lancer le scan
      </Button>
    </div>
  );
};

export default ScanUsersTool;

