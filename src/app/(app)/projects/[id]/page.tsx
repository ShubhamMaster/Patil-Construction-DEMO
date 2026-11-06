import ProjectDetail from "@/components/ProjectDetail";
import { projects } from "@/lib/data";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  return <ProjectDetail id={id} />;
}
