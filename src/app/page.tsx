"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { PageLoader } from "@/components/ui/Loading";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(`/${user.role}`);
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  return <PageLoader />;
}
