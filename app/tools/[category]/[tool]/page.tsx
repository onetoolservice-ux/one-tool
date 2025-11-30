import { ALL_TOOLS } from "@/app/lib/tools-data";
import ToolClient from "./ToolClient";
import { Metadata } from "next";

// 1. GENERATE STATIC PARAMS
export async function generateStaticParams() {
  return ALL_TOOLS.map((tool) => ({
    category: tool.category,
    tool: tool.id,
  }));
}

// 2. GENERATE SEO METADATA
export async function generateMetadata(props: { params: Promise<{ tool: string; category: string }> }): Promise<Metadata> {
  const params = await props.params;
  const toolData = ALL_TOOLS.find((t) => t.id === params.tool);

  if (!toolData) {
    return {
      title: "Tool Not Found | One Tool",
      description: "The requested utility could not be found.",
    };
  }

  return {
    title: `${toolData.title} - Free Online ${toolData.category} Tool`,
    description: `${toolData.desc} Use this tool 100% offline in your browser. Privacy-first ${toolData.title} for professionals.`,
    keywords: [toolData.title, toolData.category, "offline tool", "privacy first", "developer utils"],
    openGraph: {
      title: toolData.title,
      description: toolData.desc,
      type: "website",
    }
  };
}

// 3. RENDER THE CLIENT COMPONENT (With Params!)
export default async function ToolPage(props: { params: Promise<{ tool: string; category: string }> }) {
  const params = await props.params;
  return <ToolClient params={params} />;
}
