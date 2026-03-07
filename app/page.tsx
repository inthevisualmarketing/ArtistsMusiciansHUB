"use client";

import { useState, useEffect } from "react";
import BootSequence from "@/components/BootSequence";
import AMHHomePage from "@/components/AMHHomePage";

export default function RootPage() {
  const [showBoot, setShowBoot] = useState(true);
  const [ready, setReady] = useState(false);

  // Check sessionStorage on mount — skip boot if already seen this session
  useEffect(() => {
    try {
      if (sessionStorage.getItem("amh-booted")) {
        setShowBoot(false);
      }
    } catch {
      // sessionStorage not available — show boot
    }
    setReady(true);
  }, []);

  // Don't render anything until we've checked sessionStorage (prevents flash)
  if (!ready) return null;

  // Already booted this session — go straight to homepage
  if (!showBoot) {
    return <AMHHomePage />;
  }

  // First visit this session — show boot sequence
  return (
    <BootSequence>
      <BootComplete />
    </BootSequence>
  );
}

// This component renders when boot finishes — sets the flag and shows homepage
function BootComplete() {
  useEffect(() => {
    try {
      sessionStorage.setItem("amh-booted", "1");
    } catch {
      // sessionStorage not available
    }
  }, []);

  return <AMHHomePage />;
}
