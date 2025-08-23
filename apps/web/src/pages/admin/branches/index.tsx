import Link from "next/link";
import { useEffect, useState } from "react";

type Branch = { id: string; name: string };

export default function BranchesAdmin() {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    fetch("/api/v1/branches")
      .then(r => r.json())
      .then(setBranches);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Управление филиалами</h1>
      <ul>
        {branches.map(b => (
          <li key={b.id}>
            <Link href={`/admin/branches/${b.id}`}>{b.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
