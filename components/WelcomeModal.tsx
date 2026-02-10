'use client';

import { useState, useEffect } from 'react';
import { X, Kanban, Table, CheckSquare, Plus, MousePointer, Move } from 'lucide-react';
import { useMementotask } from '@/lib/context';
import { cn } from '@/lib/utils';

const DISMISS_KEY = 'mementotask_tutorial_dismissed';

interface TutorialStep {
  icon: typeof Kanban;
  title: string;
  description: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    icon: Kanban,
    title: 'Visualização Kanban',
    description: 'Organize seus projetos em colunas por status. Arraste cards entre colunas para mudar o status.',
  },
  {
    icon: Table,
    title: 'Visualização em Tabela',
    description: 'Veja todos os itens em uma lista hierárquica. Clique nas setas para expandir/recolher.',
  },
  {
    icon: Plus,
    title: 'Criar Novos Itens',
    description: 'Clique em "Novo Projeto" ou use o botão + nas tarefas para criar subtarefas.',
  },
  {
    icon: MousePointer,
    title: 'Editar e Excluir',
    description: 'Clique em qualquer item para editar. Use o ícone de lixeira para excluir.',
  },
  {
    icon: Move,
    title: 'Drag & Drop',
    description: 'Arraste itens para reorganizar. Mova tarefas entre projetos ou mude a ordem.',
  },
  {
    icon: CheckSquare,
    title: 'Marcar como Concluído',
    description: 'Use os checkboxes para marcar tarefas como concluídas diretamente na tabela.',
  },
];

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { items } = useMementotask();

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed === 'true') return;

    // Mostra para novos usuarios (poucos items ou nenhum)
    if (items.length <= 10) {
      setIsOpen(true);
    }
  }, [items.length]);

  function handleClose() {
    localStorage.setItem(DISMISS_KEY, 'true');
    setIsOpen(false);
  }

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface-1 p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">
            Bem-vindo ao Mementotask! 🎉
          </h1>
          <p className="text-text-secondary">
            Seu gerenciador de projetos hierárquico. Vamos começar com um tour rápido?
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex justify-center gap-2">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                index === currentStep
                  ? 'w-8 bg-accent-projeto'
                  : index < currentStep
                  ? 'bg-accent-projeto/50'
                  : 'bg-surface-3'
              )}
            />
          ))}
        </div>

        {/* Tutorial Content */}
        <div className="mb-8 rounded-xl border border-border bg-surface-0 p-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent-projeto/10">
            <Icon className="h-10 w-10 text-accent-projeto" />
          </div>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">
            {step.title}
          </h2>
          <p className="text-text-secondary leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              localStorage.setItem(DISMISS_KEY, 'true');
              setIsOpen(false);
            }}
            className="rounded-lg px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Nao mostrar novamente
          </button>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="rounded-lg border border-border bg-surface-2 px-6 py-2 text-sm font-medium text-text-primary hover:bg-surface-3 transition-colors"
              >
                Anterior
              </button>
            )}

            {currentStep < TUTORIAL_STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="rounded-lg bg-accent-projeto px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Proximo
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="rounded-lg bg-accent-projeto px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Comecar a usar!
              </button>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Project info */}
        <div className="mt-8 rounded-lg border border-accent-projeto/20 bg-accent-projeto/5 p-4">
          <p className="text-sm text-text-secondary">
            <span className="font-medium text-accent-projeto">💡 Dica:</span> Criamos um projeto de exemplo para você. 
            Clique em qualquer item para editar, ou use o botão "Novo Projeto" para criar seus próprios projetos!
          </p>
        </div>
      </div>
    </div>
  );
}
