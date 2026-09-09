import { WorkspaceShell } from '@/app/components/workspace/WorkspaceShell';

export default function MyFinanceLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell slug="my-finance">{children}</WorkspaceShell>;
}
