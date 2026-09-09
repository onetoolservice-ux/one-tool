import { WorkspaceShell } from '@/app/components/workspace/WorkspaceShell';

export default function MyBusinessLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell slug="my-business">{children}</WorkspaceShell>;
}
