import { Suspense } from "react";
import AcademicStandardDetailClient from "@/components/academic-standards/academic-standard-detail";

export default function AcademicStandardDetail({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <AcademicStandardDetailClient id={params.id} />
    </Suspense>
  );
}
