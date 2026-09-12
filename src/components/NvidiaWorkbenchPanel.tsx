import { ConsoleCard } from '@/components/ConsoleCard'
import { motion } from 'framer-motion'
import {
  ArrowSquareOut,
  Cube,
  GitBranch,
  GraphicsCard,
  ShieldCheck,
} from '@phosphor-icons/react'

const workflowCapabilities = [
  {
    icon: Cube,
    title: 'Reproducible environments',
    description: 'Container-based project environments keep development dependencies and setup versioned.',
  },
  {
    icon: GitBranch,
    title: 'Git-backed workflow',
    description: 'TKS source and project configuration can move through the existing repository workflow.',
  },
  {
    icon: GraphicsCard,
    title: 'Local or remote compute',
    description: 'AI Workbench can manage development on a local workstation or a connected remote system.',
  },
]

export function NvidiaWorkbenchPanel() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      aria-labelledby="nvidia-workbench-title"
      className="mb-6"
    >
      <ConsoleCard glass className="relative overflow-hidden border border-primary/20 p-5 md:p-6">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <GraphicsCard size={18} weight="duotone" aria-hidden="true" />
                Development environment
              </div>
              <h2 id="nvidia-workbench-title" className="text-xl font-bold tracking-tight md:text-2xl">
                TKS works with NVIDIA AI Workbench
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                TKS uses NVIDIA AI Workbench in selected AI and media engineering workflows.
                It provides a reproducible, Git-centered environment for developing and testing
                TKS projects across local and remote compute.
              </p>
            </div>

            <a
              href="https://docs.nvidia.com/ai-workbench/user-guide/latest/overview/introduction.html"
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              NVIDIA AI Workbench
              <ArrowSquareOut size={15} aria-hidden="true" />
            </a>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {workflowCapabilities.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-lg border border-border/60 bg-background/35 p-3">
                <Icon size={18} weight="duotone" className="mb-2 text-secondary" aria-hidden="true" />
                <h3 className="text-xs font-semibold">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-2 border-t border-border/60 pt-4">
            <ShieldCheck size={16} weight="duotone" className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              NVIDIA is identified as the provider of a development tool used in parts of the TKS
              workflow. TKS is independently developed; this statement does not claim NVIDIA
              sponsorship, endorsement, partnership, or corporate affiliation.
            </p>
          </div>
        </div>
      </ConsoleCard>
    </motion.section>
  )
}
