import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Users, FileSearch } from 'lucide-react'
import { Wordmark, PrimaryButton, SecondaryButton, Card, Pill } from '../components/ui'

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink-950 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(53,224,208,0.14), transparent 40%), radial-gradient(circle at 85% 75%, rgba(53,224,208,0.10), transparent 45%)',
        }}
      />
      <header className="relative z-10 max-w-5xl mx-auto px-6 pt-8 flex items-center justify-between">
        <Wordmark />
        <Link to="/admin" className="text-sm text-mist-400 hover:text-cyan-400 transition-colors">
          Área do apresentador →
        </Link>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-16 text-center animate-rise">
        <Pill tone="cyan">Simulação: TalentFlow / HireLens</Pill>
        <h1 className="mt-6 font-[var(--font-display)] text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-mist-100">
          Você deixaria uma <span className="text-cyan-400">IA</span> decidir
          <br /> quem merece uma oportunidade?
        </h1>
        <p className="mt-6 text-mist-300 text-lg leading-relaxed max-w-xl mx-auto">
          80.000 candidatos. 3.000 vagas. Um algoritmo de pontuação chamado HireLens, e uma auditoria que encontrou
          indícios de viés. A turma vai decidir, dilema a dilema, o que a TalentFlow deve fazer.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/participar">
            <PrimaryButton className="w-full sm:w-auto text-base px-8 py-4">
              Participar do jogo <ArrowRight size={18} />
            </PrimaryButton>
          </Link>
          <Link to="/admin">
            <SecondaryButton className="w-full sm:w-auto text-base px-8 py-4">Sou o apresentador</SecondaryButton>
          </Link>
        </div>
      </main>

      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24 grid sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <Users size={20} className="text-cyan-400 mb-3" />
          <h3 className="font-semibold text-mist-100 mb-1">Decisão coletiva</h3>
          <p className="text-sm text-mist-400 leading-relaxed">
            Cada participante vota pelo celular. Nenhuma resposta é "certa": o que importa é qual valor a turma
            prioriza.
          </p>
        </Card>
        <Card className="p-5">
          <FileSearch size={20} className="text-cyan-400 mb-3" />
          <h3 className="font-semibold text-mist-100 mb-1">Auditoria em tempo real</h3>
          <p className="text-sm text-mist-400 leading-relaxed">
            Teste o próprio HireLens com candidatos fictícios e veja quando o sistema aponta possível viés.
          </p>
        </Card>
        <Card className="p-5">
          <ShieldCheck size={20} className="text-cyan-400 mb-3" />
          <h3 className="font-semibold text-mist-100 mb-1">Um código de ética</h3>
          <p className="text-sm text-mist-400 leading-relaxed">
            No final, as escolhas da turma viram artigos de um Código de Ética real, gerado a partir dos votos.
          </p>
        </Card>
      </section>

      <footer className="relative z-10 max-w-3xl mx-auto px-6 pb-12 text-center">
        <p className="text-mist-400 text-sm italic">
          "A IA pode recomendar. A decisão precisa poder ser questionada."
        </p>
      </footer>
    </div>
  )
}
