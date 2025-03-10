import { Suspense } from "react";
import ClassroomTimeMachine from "@/components/classroom-timemachine/classroom-time-machine";

export default function ClassroomTimeMachinePage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <ClassroomTimeMachine />
    </Suspense>
  );
}
