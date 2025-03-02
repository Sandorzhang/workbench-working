"use client";

import React from "react";
import { MentorHub } from "@/components/mentor-hub/mentor-hub";
import { Users } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { SectionContainer } from "@/components/ui/section-container";

export default function MentorHubPage() {
  return (
    <PageContainer>
      <SectionContainer
        title="全员导师管理系统"
        description="浏览、管理和分配导师资源"
        icon={<Users className="h-5 w-5" />}
        iconBackground="bg-primary/10"
        iconColor="text-primary"
      >
        <MentorHub />
      </SectionContainer>
    </PageContainer>
  );
} 