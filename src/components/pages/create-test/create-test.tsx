"use server";

import TestForm from "@/components/test/TestForm";

export default async function CreateTestPage() {
  return (
    <main className="p-3 bg-gray-50 min-h-screen text-gray-900">
      <TestForm />
    </main>
  );
}
