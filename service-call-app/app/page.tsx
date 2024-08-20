import Link from "next/link";
export default async function Home() {
  return (
    <main>
      <div>
        <Link href="/dashboard">DashBoard </Link>
      </div>
    </main>
  );
}
