import Link from "next/link";
export default async function Home() {
const data = await fetch('https://catfact.ninja/fact').then((res) => res.json());

  return (
    <div>
      <Link href="/dashboard">DashBoard </Link>
      <p>{data.fact}</p>
    </div>
  );
}
