import { Suspense } from "react";
import RoadmapDetailClient from "@/components/roadmaps/RoadmapDetailClient";

async function RoadmapLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoadmapDetailClient id={id} />;
}

export default function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
          Loading roadmap...
        </div>
      }
    >
      <RoadmapLoader params={params} />
    </Suspense>
  );
}
