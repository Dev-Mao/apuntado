import { Suspense } from "react";

import { HomeScreen, LinkedHomeScreen } from "@/features/home";

export default function HomePage() {
  return (
    <Suspense fallback={<HomeScreen linkCode={null} />}>
      <LinkedHomeScreen />
    </Suspense>
  );
}
