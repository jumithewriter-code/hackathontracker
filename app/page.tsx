import { ClientOnly } from "@/components/ClientOnly";
import { Tracker } from "@/components/Tracker";
import { listHackathons } from "@/lib/repo";
import { Providers } from "./providers";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Load on the server so the table appears without a loading spinner.
  const initialData = await listHackathons({ archived: "all" });
  return (
    <Providers>
      {/* Dates and "days left" depend on the viewer's clock and timezone, so render in the browser. */}
      <ClientOnly>
        <Tracker initialData={initialData} />
      </ClientOnly>
    </Providers>
  );
}
