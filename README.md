# HireLens Ético

Jogo interativo de decisões éticas sobre IA no recrutamento, construído para uso em sala de aula/apresentação acadêmica.

A turma acessa pelo celular via QR Code, vota em 6 dilemas sobre o sistema fictício **HireLens** (da empresa fictícia **TalentFlow**), e ao final o produto transforma as decisões coletivas em um **Código de Ética** gerado dinamicamente.

> "A IA pode recomendar. A decisão precisa poder ser questionada."

---

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Supabase** — Postgres + Realtime (sincronização dos votos entre celulares e o painel)
- **qrcode.react** — geração do QR Code
- **react-router-dom** — rotas
- **lucide-react** — ícones

Todos os dilemas, opções, valores éticos e artigos-base do Código de Ética ficam versionados em código (`src/data/`), não no banco — o banco guarda apenas sessões, participantes e votos. Isso facilita editar o conteúdo do jogo sem migrações.

---

## Como funciona (arquitetura resumida)

```
src/
  data/dilemmas.ts      6 dilemas: situação, pergunta, opções, valores, conflito
  data/values.ts        rótulos dos valores + 7 artigos-base do Código de Ética
  lib/supabase.ts       cliente Supabase (lê VITE_SUPABASE_URL / ANON_KEY)
  lib/db.ts             CRUD + subscriptions realtime (sessions/participants/votes)
  lib/ethicsEngine.ts   apuração de votos -> score de valores -> Código de Ética
  lib/mockScoring.ts    modelo simulado usado na tela de auditoria (/auditoria)
  lib/localState.ts     identidade do participante e sessão do admin (localStorage)
  pages/                Landing, Participate, Game, FinalCode, AdminLogin,
                         AdminDashboard (inclui Modo Apresentação), AdminQR, Audit
```

**Fluxo de decisão → Código de Ética** (ver `ethicsEngine.ts`):

```
votos da turma
  → apuração por dilema (tallyDilemma)
  → score 0–100 por valor ético (computeValueScores)
  → força de cada artigo-base (forte / moderado / fraco)
  → princípios gerados a partir da opção vencedora de cada dilema
  → veredito final (buildFinalVerdict)
```

Os 7 artigos do Código de Ética são pré-definidos (para garantir coerência jurídica/textual), mas o **texto exibido, a força de cada artigo e o veredito final mudam de acordo com os votos reais da turma** — nada é um resultado fixo mostrado como se fosse gerado.

---

## Rodando localmente

### 1. Pré-requisitos
- Node 18+
- Uma conta gratuita em [supabase.com](https://supabase.com)

### 2. Criar o projeto Supabase
1. Crie um novo projeto no Supabase.
2. Vá em **SQL Editor** → **New query**, cole o conteúdo de `supabase/migrations/0001_init.sql` e execute.
   Isso cria as tabelas `sessions`, `participants`, `votes`, habilita Realtime nelas e configura RLS permissiva (adequada para uma dinâmica de sala de aula sem dados pessoais — veja comentários no próprio arquivo SQL para endurecer se for deixar o app publicamente acessível por muito tempo).
3. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Preencha `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e defina `VITE_ADMIN_PASSWORD` (senha da área do apresentador).

### 4. Instalar e rodar
```bash
npm install
npm run dev
```
Abra `http://localhost:5173`.

### 5. Testar o fluxo completo
1. Acesse `/admin`, entre com a senha, clique em **Criar nova sessão**.
2. Clique em **Ver QR Code** — escaneie com o celular (ou abra o link manualmente em outra aba/dispositivo).
3. No celular: informe um apelido (opcional) e o código da sessão, entre no jogo.
4. No painel: **Abrir votação** → participante vota → **Encerrar votação** → **Revelar resultado** → **Próximo dilema**, repetindo até o dilema 6 → **Finalizar jogo**.
5. Acesse `/final/<CÓDIGO>` para ver o Código de Ética gerado.
6. Use **Modo apresentação** no painel para projetar em uma TV, e `/auditoria` para a demonstração de viés.

**Testando vários participantes no mesmo computador:** cada aba guarda sua própria identidade de participante (via `sessionStorage`, isolado por aba). Para simular alunos diferentes, abra cada aba com **Ctrl/Cmd+T** e cole a URL — **não use "Duplicar aba"**, porque o Chrome/Edge copiam o `sessionStorage` da aba original para a duplicada, e as duas acabam votando como o mesmo participante.

---

## Deploy (Vercel/Netlify)

1. Suba o repositório para o GitHub.
2. Na Vercel/Netlify, importe o repositório.
   - Build command: `npm run build`
   - Output directory: `dist`
3. Configure as mesmas variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_PASSWORD`) no painel do serviço.
4. Publique. O QR Code em `/admin/qr/:code` usa `window.location.origin` automaticamente — nenhuma URL fixa é necessária.

Se o roteamento client-side (`/jogo/:code`, `/final/:code`, etc.) retornar 404 ao recarregar a página no host escolhido, adicione um rewrite catch-all para `index.html`:
- **Vercel**: crie `vercel.json` com `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`
- **Netlify**: crie `public/_redirects` com `/*  /index.html  200`

---

## Privacidade

- Não é coletado nome completo, e-mail, telefone ou localização.
- O apelido é opcional e só existe no navegador do participante + na tabela `participants` (sem vínculo com identidade real).
- **Reiniciar sessão**, no painel do apresentador, apaga todos os participantes e votos daquela sessão.
- Nenhum dado de candidato é real — os dois cenários em `/auditoria` usam um modelo de pontuação simulado (`lib/mockScoring.ts`), criado apenas para fins didáticos.

---

## Solução de problemas

**`Cannot find native binding` / `@rolldown/binding-...` ao rodar `npm run dev` no Windows**
Isso acontece se o `node_modules` foi instalado com uma versão do Vite baseada em Rolldown (pacotes nativos por SO) enquanto havia um cache/lockfile antigo — é um bug conhecido do npm com dependências opcionais (npm/cli#4828). Este projeto já está travado em `vite@^6` (baseado em Rollup, sem binários nativos por plataforma), então isso não deve mais ocorrer. Se acontecer:
```bash
rd /s /q node_modules
del package-lock.json
npm install
```

**`npm warn EBADENGINE` para pacotes que exigem Node ≥ 22**
Também resolvido ao travar `vite@^6`, `@vitejs/plugin-react@^4`. Se aparecer de novo, confira se `package.json` não foi sobrescrito com versões mais novas por um `npm install <pacote>@latest`.

---

## Limitações conhecidas e próximos passos

- **RLS permissiva**: adequada para uma dinâmica ao vivo, curta e sem dados sensíveis. Para um deploy público de longa duração, mova as mutações (criar sessão, votar, resetar) para uma Supabase Edge Function que valide a senha do apresentador no servidor, e restrinja as policies de `sessions`/`participants` a `select`.
- **Autenticação do admin** é apenas uma senha comparada no client (`VITE_ADMIN_PASSWORD`), suficiente para uma apresentação em sala, mas não para múltiplos apresentadores com controle de acesso individual.
- **Sem paginação/histórico de sessões**: o painel não lista sessões antigas; guarde o código gerado se quiser retomar depois.
- Chunk final de JS acima de 500kB (aviso de build, não erro) — pode ser reduzido com `dynamic import()` por rota, se necessário.
