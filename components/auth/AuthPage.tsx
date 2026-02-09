'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

type Mode = 'login' | 'signup';

export function AuthPage() {
  const { signIn, signUp, loading } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      } else {
        if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          setSubmitting(false);
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          setError('Verifique seu email para confirmar a conta.');
        }
      }
    } catch (err) {
      setError('Erro ao processar requisição');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-0">
        <Loader2 className="h-8 w-8 animate-spin text-accent-projeto" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">
            {mode === 'login' ? 'Bem-vindo' : 'Crie sua conta'}
          </h1>
          <p className="text-text-muted">
            {mode === 'login' ? 'Entre para gerenciar seus projetos' : 'Comece gratuitamente'}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface-1 p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-text-secondary">
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-accent-projeto focus:outline-none focus:ring-1 focus:ring-accent-projeto"
                  placeholder="Seu nome"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-text-secondary">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-accent-projeto focus:outline-none focus:ring-1 focus:ring-accent-projeto"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-text-secondary">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-accent-projeto focus:outline-none focus:ring-1 focus:ring-accent-projeto"
                placeholder="••••••••"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-text-secondary">
                  Confirmar Senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-accent-projeto focus:outline-none focus:ring-1 focus:ring-accent-projeto"
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-900/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-accent-projento px-4 py-2 font-medium text-white transition-colors hover:bg-accent-projeto/90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent-projeto)' }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Criar conta
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-text-muted">
            {mode === 'login' ? (
              <>
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-accent-projeto hover:underline"
                  style={{ color: 'var(--accent-projeto)' }}
                >
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-accent-projeto hover:underline"
                  style={{ color: 'var(--accent-projeto)' }}
                >
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-text-muted">
          <p className="mb-2 font-medium">Mementotask</p>
          <p>Gerencie seus projetos de forma simples e eficiente</p>
        </div>
      </div>
    </div>
  );
}
