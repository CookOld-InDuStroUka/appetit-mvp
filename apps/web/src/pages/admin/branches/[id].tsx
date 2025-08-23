 import { useRouter } from "next/router";
 import { useEffect, useState } from "react";

 type Dish = { id: string; name: string; available: boolean };

 export default function BranchAvailability() {
   const router = useRouter();
   const branchId = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
   const [dishes, setDishes] = useState<Dish[]>([]);

   useEffect(() => {
     if (!branchId) return;
     fetch(`/api/v1/admin/branches/${branchId}/dishes`)
       .then(r => r.json())
       .then(setDishes);
   }, [branchId]);

   const toggle = async (dishId: string, available: boolean) => {
     await fetch(`/api/v1/admin/branches/${branchId}/dishes/${dishId}`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ available })
     });
     setDishes(d => d.map(x => x.id === dishId ? { ...x, available } : x));
   };

   return (
     <div style={{ padding: 24 }}>
       <h1>Ассортимент филиала</h1>
       <ul>
         {dishes.map(d => (
           <li key={d.id}>
             <label>
               <input
                 type="checkbox"
                 checked={d.available}
                 onChange={e => toggle(d.id, e.target.checked)}
               /> {d.name}
             </label>
           </li>
         ))}
       </ul>
     </div>
   );
 }
