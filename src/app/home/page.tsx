"use server";
import HomePage from "@/components/pages/home/HomePage";
import ProtectedRoute from "@/components/ProtectedRoute";

export default async function Page() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}
