import { Suspense } from "react";
import TopicWorkspaceClient from "@/components/topics/TopicWorkspaceClient";

async function TopicLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TopicWorkspaceClient id={id} />;
}

export default function TopicWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
          Loading topic workspace...
        </div>
      }
    >
      <TopicLoader params={params} />
    </Suspense>
  );
}
