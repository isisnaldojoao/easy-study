# Study Flow

Plataforma local de organização acadêmica — disciplinas, atividades, calendário, planejamento, revisão, materiais e relatórios.

Nesta versão os dados ficam **no navegador** (IndexedDB via Dexie). Ideal para validar o produto localmente e evoluir depois para PWA offline.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + componentes no estilo shadcn/ui
- Dexie (IndexedDB)
- React Hook Form + Zod
- FullCalendar
- TipTap (editor de revisão)
- Recharts

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

1. Crie uma conta em **Cadastro**
2. Cadastre disciplinas e atividades
3. Use o calendário, planejamento e central de revisão

## Persistência

| Dado | Onde |
|------|------|
| Sessão autenticada | `localStorage` (`studyflow.session`) |
| Usuários, disciplinas, atividades, etc. | IndexedDB (`studyflow`) |
| Arquivos de materiais | Blobs no IndexedDB |

Limpar dados do site no navegador apaga a conta e todo o conteúdo.

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm start` — servir build
- `npm run lint` — ESLint

## Estrutura

```
src/
  app/(auth)/          # login, cadastro, recuperar senha
  app/(app)/           # área autenticada
  components/          # UI, layout, formulários
  hooks/               # live queries Dexie
  lib/                 # db, datas, crypto, constants
  providers/           # auth + tema
  schemas/             # Zod
  services/            # regras de negócio / CRUD
  types/
```

## PWA (após subir na Vercel)

O app já tem **manifest**, **ícones** e **service worker** (Serwist).

1. Faça o deploy na Vercel (`git push` ou import do repo).
2. Abra o site em **HTTPS** (a Vercel já entrega isso).
3. No celular/desktop:
   - **Chrome/Edge (Android/Desktop):** menu → *Instalar app* / ícone de instalação na barra de endereço.
   - **Safari (iOS):** Compartilhar → *Adicionar à Tela de Início*.
4. Confirme em DevTools → Application → Manifest / Service Workers que `/serwist/sw.js` está ativo.

Dados continuam locais (IndexedDB). Offline serve a página `/~offline` quando a rede cair.

## Observações

- Fuso horário de referência: `America/Sao_Paulo`
- Notificações internas com deduplicação
- Push do navegador preparado nas configurações
