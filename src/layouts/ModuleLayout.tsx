import type {ReactNode} from 'react';
import {motion} from 'framer-motion';
import SectionHeading from '@/components/ui/SectionHeading';
import PrevNextNav from '@/components/ui/PrevNextNav';
import {useMarkVisited} from '@/hooks/useMarkVisited';

interface ModuleLayoutProps {
  moduleId: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

/** Shared shell for every module page: heading, fade-in, prev/next footer, progress tracking. */
export default function ModuleLayout({moduleId, eyebrow, title, description, children}: ModuleLayoutProps) {
  useMarkVisited(moduleId);

  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut'}}
    >
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="space-y-14">{children}</div>
      <PrevNextNav moduleId={moduleId} />
    </motion.div>
  );
}
