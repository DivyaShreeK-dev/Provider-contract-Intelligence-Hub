import { createFileRoute } from "@tanstack/react-router";
import { ContractViewer } from "@/components/ContractViewer";

export const Route = createFileRoute("/_shell/contracts/viewer/$id")({
  validateSearch: (s: Record<string, unknown>): { focus?: string; from?: string } => ({ focus: typeof s.focus === "string" ? s.focus : undefined, from: typeof s.from === "string" ? s.from : undefined }),
  head: () => ({ meta: [
    { title: "Contract Viewer — Provider Contract Intelligence" },
    { name: "description", content: "Review, edit, and sign a provider agreement with clause intelligence." },
    { property: "og:title", content: "Contract Viewer — Provider Contract Intelligence" },
    { property: "og:description", content: "Review, edit, and sign a provider agreement with clause intelligence." },
  ] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { focus, from } = Route.useSearch();
  return <ContractViewer key={id} id={id} focus={focus} fromPipeline={from === "pipeline"} />;
}
