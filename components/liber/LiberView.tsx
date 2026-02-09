'use client';

import { useState, useMemo } from 'react';
import { ArrowLeft, Quote, Music, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Dictum {
  latin: string;
  translation: string;
  author?: string;
}

const DICTA: Dictum[] = [
  { latin: 'Memento mori', translation: 'Lembre-se de que voce vai morrer' },
  { latin: 'Carpe diem', translation: 'Aproveite o dia', author: 'Horacio' },
  { latin: 'Amor fati', translation: 'Amor ao destino', author: 'Marco Aurelio' },
  { latin: 'Per aspera ad astra', translation: 'Atraves das dificuldades, ate as estrelas' },
  { latin: 'Ars longa, vita brevis', translation: 'A arte e longa, a vida e breve', author: 'Hipocrates' },
  { latin: 'Cogito ergo sum', translation: 'Penso, logo existo', author: 'Descartes' },
  { latin: 'Dum spiro, spero', translation: 'Enquanto respiro, espero', author: 'Cicero' },
  { latin: 'Veni, vidi, vici', translation: 'Vim, vi, venci', author: 'Julio Cesar' },
  { latin: 'Nosce te ipsum', translation: 'Conhece a ti mesmo' },
  { latin: 'Tempus fugit', translation: 'O tempo foge', author: 'Virgilio' },
  { latin: 'Errare humanum est', translation: 'Errar e humano', author: 'Seneca' },
  { latin: 'Audentes fortuna iuvat', translation: 'A fortuna favorece os audazes', author: 'Virgilio' },
  { latin: 'Festina lente', translation: 'Apresse-se devagar', author: 'Augusto' },
  { latin: 'Non ducor, duco', translation: 'Nao sou conduzido, conduzo' },
  { latin: 'Labor omnia vincit', translation: 'O trabalho tudo vence', author: 'Virgilio' },
  { latin: 'Sapere aude', translation: 'Ouse saber', author: 'Horacio' },
  { latin: 'Acta non verba', translation: 'Acoes, nao palavras' },
  { latin: 'Ad astra per aspera', translation: 'Ate as estrelas, por caminhos asperos' },
  { latin: 'Fortes fortuna adiuvat', translation: 'A sorte ajuda os fortes', author: 'Terencio' },
  { latin: 'Veritas lux mea', translation: 'A verdade e minha luz' },
  { latin: 'Sic parvis magna', translation: 'A grandeza nasce da pequenez' },
  { latin: 'Respice post te, hominem te esse memento', translation: 'Olhe para tras, lembre-se de que voce e humano' },
  { latin: 'Sustine et abstine', translation: 'Suporte e abstenha-se', author: 'Epiteto' },
  { latin: 'Lux in tenebris lucet', translation: 'A luz brilha nas trevas' },
  { latin: 'Qui audet adipiscitur', translation: 'Quem ousa, conquista' },
  { latin: 'Nihil sine labore', translation: 'Nada sem trabalho' },
  { latin: 'Vincit qui se vincit', translation: 'Vence quem vence a si mesmo' },
  { latin: 'Littera scripta manet', translation: 'A letra escrita permanece' },
  { latin: 'De gustibus non est disputandum', translation: 'Sobre gostos nao se discute' },
  { latin: 'Forma dat esse rei', translation: 'A forma da existencia as coisas' },
];

interface Playlist {
  title: string;
  description: string;
  spotifyUri: string;
  spotifyUrl: string;
}

const PLAYLISTS: Playlist[] = [
  {
    title: 'Deep Focus',
    description: 'Mantenha a concentracao com musica ambiente',
    spotifyUri: '37i9dQZF1DWZeKCadgRdKQ',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ',
  },
  {
    title: 'Lo-Fi Beats',
    description: 'Beats relaxantes para programar',
    spotifyUri: '37i9dQZF1DWWQRwui0ExPn',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
  },
  {
    title: 'Classical Focus',
    description: 'Musica classica para produtividade',
    spotifyUri: '37i9dQZF1DX7K31D69s4M1',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX7K31D69s4M1',
  },
  {
    title: 'Ambient Relaxation',
    description: 'Sons ambientais para foco profundo',
    spotifyUri: '37i9dQZF1DX3Ogo9pFvBkY',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY',
  },
  {
    title: 'Coding Mode',
    description: 'Eletronica e synthwave para codar',
    spotifyUri: '37i9dQZF1DX5trt9i14X7j',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX5trt9i14X7j',
  },
  {
    title: 'Dark Academia',
    description: 'A estetica do conhecimento antigo',
    spotifyUri: '37i9dQZF1DWTvNyxOwkztu',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWTvNyxOwkztu',
  },
];

interface LiberViewProps {
  onBack: () => void;
}

export function LiberView({ onBack }: LiberViewProps) {
  const [highlightedIdx, setHighlightedIdx] = useState(() =>
    Math.floor(Math.random() * DICTA.length),
  );

  const highlighted = DICTA[highlightedIdx];

  const shuffledDicta = useMemo(() => {
    const others = DICTA.filter((_, i) => i !== highlightedIdx);
    // Simple shuffle
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    return others;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedIdx]);

  function randomize() {
    setHighlightedIdx(Math.floor(Math.random() * DICTA.length));
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="rounded-xl p-2 text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Liber</h1>
          <p className="text-sm text-text-muted italic font-heading">&ldquo;Littera scripta manet&rdquo;</p>
        </div>
      </div>

      {/* Featured dictum */}
      <div className="relative rounded-2xl border border-border bg-surface-1 p-8 mb-8 overflow-hidden">
        <Quote className="absolute top-4 left-4 h-12 w-12 text-accent-projeto/10" />
        <div className="relative text-center">
          <p className="text-3xl font-heading font-bold text-text-primary mb-3 italic">
            &ldquo;{highlighted.latin}&rdquo;
          </p>
          <p className="text-base text-text-secondary mb-1">{highlighted.translation}</p>
          {highlighted.author && (
            <p className="text-sm text-text-muted">— {highlighted.author}</p>
          )}
          <button
            onClick={randomize}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Outro ditado
          </button>
        </div>
      </div>

      {/* Two columns: Dicta + Playlists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dicta */}
        <div>
          <h2 className="text-lg font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Quote className="h-5 w-5 text-accent-projeto" />
            Dicta Latina
          </h2>
          <div className="space-y-2">
            {shuffledDicta.map((d) => (
              <div
                key={d.latin}
                className="rounded-xl border border-border bg-surface-1 px-4 py-3 hover:bg-surface-2 transition-colors"
              >
                <p className="text-sm font-heading font-medium text-text-primary italic">
                  {d.latin}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {d.translation}
                  {d.author && <span className="ml-1">— {d.author}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Playlists */}
        <div>
          <h2 className="text-lg font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Music className="h-5 w-5 text-accent-tarefa" />
            Playlists para Foco
          </h2>
          <div className="space-y-3">
            {PLAYLISTS.map((pl) => (
              <div key={pl.spotifyUri} className="rounded-xl border border-border bg-surface-1 overflow-hidden">
                <iframe
                  src={`https://open.spotify.com/embed/playlist/${pl.spotifyUri}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="border-0"
                  title={pl.title}
                />
                <div className="px-4 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{pl.title}</p>
                    <p className="text-xs text-text-muted">{pl.description}</p>
                  </div>
                  <a
                    href={pl.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-1.5 text-text-muted hover:text-accent-tarefa hover:bg-surface-2 transition-colors"
                    title="Abrir no Spotify"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
