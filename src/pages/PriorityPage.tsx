import ModuleLayout from '@/layouts/ModuleLayout';
import PriorityTimeline from '@/components/ui/PriorityTimeline';
import {priorityIntro, priorityPhases} from '@/data/content/priority';

export default function PriorityPage() {
  return (
    <ModuleLayout moduleId="priority" eyebrow="Module 1" title="La priorité">
      <p className="max-w-2xl text-slate-300">{priorityIntro}</p>
      <div>
        <h2 className="mb-4 text-lg font-bold text-white">Cliquez une phase de partie</h2>
        <PriorityTimeline phases={priorityPhases} />
      </div>
    </ModuleLayout>
  );
}
