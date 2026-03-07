"use client";

import { useState } from "react";
import BootSequence from "@/components/BootSequence";
import AMHHomePage from "@/components/AMHHomePage";

export default function RootPage() {
  const [showBoot, setShowBoot] = useState(true);

  // When boot is showing, render it with homepage hidden behind
  // When boot finishes (phase === "done"), it calls onComplete and we swap
  if (!showBoot) {
    return <AMHHomePage />;
  }

  return (
    <BootSequence onComplete={() => setShowBoot(false)}>
      <AMHHomePage />
    </BootSequence>
  );
}
