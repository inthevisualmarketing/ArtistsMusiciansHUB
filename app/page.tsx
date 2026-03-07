"use client";

import BootSequence from "@/components/BootSequence";
import AMHHomePage from "@/components/AMHHomePage";

// ============================================================
// ROOT PAGE — Boot Sequence → Homepage
// Boot plays on first load, then reveals homepage.
// ============================================================

export default function RootPage() {
  return (
    <BootSequence>
      <AMHHomePage />
    </BootSequence>
  );
}
