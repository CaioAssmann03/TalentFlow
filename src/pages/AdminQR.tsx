import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react'
import { Wordmark, Card, SecondaryButton, LoadingScreen } from '../components/ui'
import { getSessionByCode } from '../lib/db'
import { isAdminAuthed } from '../lib/localState'
import type { GameSession } from '../types'

export default function AdminQR() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<GameSession | null>(null)
  const [copied, setCopied] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!isAdminAuthed()) navigate('/admin')
  }, [navigate])

  useEffect(() => {
    if (!code) return
    getSessionByCode(code).then((s) => {
      if (!s) setNotFound(true)
      else setSession(s)
    })
  }, [code])

  if (notFound) {
    return <div className="min-h-screen bg-ink-950 flex items-center justify-center text-mist-100">Sessão não encontrada.</div>
  }
  if (!session) return <LoadingScreen />

  const url = `${window.location.origin}/participar?sessao=${session.code}`

  function copyLink() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link
          to={`/admin/dashboard/${session.code}`}
          className="inline-flex items-center gap-1.5 text-sm text-mist-400 hover:text-cyan-400 mb-6"
        >
          <ArrowLeft size={15} /> Voltar ao painel
        </Link>

        <Card className="p-8 text-center animate-rise">
          <Wordmark size="sm" />
          <h1 className="mt-6 text-2xl font-semibold text-mist-100 font-[var(--font-display)]">📱 Escaneie para participar</h1>
          <p className="mt-1 text-sm text-mist-400">Aponte a câmera do celular para o código abaixo.</p>

          <div className="mt-6 bg-white rounded-2xl p-5 inline-block">
            <QRCodeSVG value={url} size={220} level="M" />
          </div>

          <p className="mt-5 font-[var(--font-mono)] text-3xl tracking-[0.25em] text-cyan-400">{session.code}</p>
          <p className="mt-1 text-xs text-mist-400 break-all">{url}</p>

          <div className="mt-6 flex flex-col gap-2">
            <SecondaryButton onClick={copyLink} className="w-full">
              {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Link copiado!' : 'Copiar link'}
            </SecondaryButton>
            <a href={`/participar?sessao=${session.code}`} target="_blank" rel="noreferrer">
              <SecondaryButton className="w-full">
                <ExternalLink size={18} /> Abrir como participante
              </SecondaryButton>
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
