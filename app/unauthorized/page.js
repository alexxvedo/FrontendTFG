// app/unauthorized/page.tsx  (Server Component)
import React, { Suspense } from "react";
import UnauthorizedClient from "@/components/unauthorized/UnauthorizedClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando…</div>}>
      <UnauthorizedClient />
    </Suspense>
  );
}
