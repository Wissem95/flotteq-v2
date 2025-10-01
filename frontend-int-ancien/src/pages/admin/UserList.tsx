// 📁 frontend/internal/src/pages/admin/UserList.tsx

import React, { useEffect, useState } from "react";
import axios from "@/lib/api";

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch(() => setUsers([]));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Liste des utilisateurs</h1>
      <ul>
        {users.map((u: any) => (
          <li key={u.id}>
            {u.prenom} {u.nom} - {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;

