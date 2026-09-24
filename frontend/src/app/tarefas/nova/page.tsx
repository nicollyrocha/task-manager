import type { Metadata } from "next";
import { TaskForm } from "@/features/tasks/components/task-form";

export const metadata: Metadata = { title: "Nova tarefa | Task Manager" };

export default function NewTaskPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Nova tarefa</h1>
      <TaskForm />
    </main>
  );
}
