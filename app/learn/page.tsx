import type { Metadata } from 'next';
import { LearningCenter } from '@/app/components/learn/LearningCenter';

export const metadata: Metadata = {
  title: 'Learning Center — One Tool',
  description:
    'Step-by-step guides aur learning paths — Personal Finance, Business OS, GST, Developer, Writer\'s OS. One Tool ka har feature sikhne ka sabse aasaan tarika.',
};

export default function LearnPage() {
  return <LearningCenter />;
}
