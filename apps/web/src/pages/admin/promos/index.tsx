import Link from "next/link";

export default function PromosAdmin() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Маркетинг</h1>
      <ul>
        <li>
          <Link href="/admin/promos/promo-codes">Промокоды</Link>
        </li>
      </ul>
    </div>
  );
}
