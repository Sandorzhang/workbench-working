"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Mentor, MentorStudent } from "@/lib/types";
import { StudentDetail } from "./student-detail";

interface MentorDetailProps {
  mentor: Mentor;
  onBack: () => void;
}

export function MentorDetail({ mentor, onBack }: MentorDetailProps) {
  const [students, setStudents] = useState<MentorStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<MentorStudent | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/mentors/${mentor.id}/students`);
        if (!response.ok) throw new Error("Failed to fetch students");

        const data = await response.json();
        setStudents(data);
      } catch (_err) {
        setError("Failed to load students");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [mentor.id]);

  if (selectedStudent) {
    return (
      <StudentDetail
        student={selectedStudent}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        返回
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>导师信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">姓名</label>
              <p className="mt-1">{mentor.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">职称</label>
              <p className="mt-1">{mentor.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium">部门</label>
              <p className="mt-1">{mentor.department}</p>
            </div>
            <div>
              <label className="text-sm font-medium">联系电话</label>
              <p className="mt-1">{mentor.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>指导学生</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <svg
                className="animate-spin h-5 w-5 text-primary mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : students.length === 0 ? (
            <div className="text-gray-500 text-center py-4">暂无指导学生</div>
          ) : (
            <div className="grid gap-4">
              {students.map((student) => (
                <Card
                  key={student.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <CardContent
                    className="p-4"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {student.studentNumber} | {student.major}{" "}
                          {student.gradeId ? `${student.gradeId}级` : ""}{" "}
                          {student.classId ? `${student.classId}班` : ""}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        查看详情
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
