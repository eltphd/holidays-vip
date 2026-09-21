import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">Not here yet.</h1>
      <p className="text-muted">That page doesn&rsquo;t exist, or it hasn&rsquo;t opened for the season.</p>
      <Link href="/" className="underline">Back to holidayz.vip</Link>
    </div>
  );
}
