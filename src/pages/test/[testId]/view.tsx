import { useRouter } from "next/router";
import { useEffect } from "react";

export default function TestPage() {
  const router = useRouter();
  const { testId } = router.query;

  useEffect(() => {
    if (!router.isReady) {
      return; // NOTE: router.query might be empty during initial render
    }

    console.log(router.query.testId);
  }, [testId, router.isReady]);
}
