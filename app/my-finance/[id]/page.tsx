import type { Metadata } from 'next';
import { generateWorkspaceToolMetadata, WorkspaceToolPage } from '@/app/lib/workspace-tool-page';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return generateWorkspaceToolMetadata({ params }, 'My Finance');
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkspaceToolPage id={id} category="My Finance" />;
}
