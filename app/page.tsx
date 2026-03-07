"use client";

import BootSequence from "@/components/BootSequence";
import AMHHomePage from "@/components/AMHHomePage";

export default function RootPage() {
  return (
    <BootSequence>
      <AMHHomePage />
    </BootSequence>
  );
}
