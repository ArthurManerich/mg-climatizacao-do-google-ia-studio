# MG Climatização

Aplicação web corporativa da MG Climatização, construída com React, TypeScript,
Vite e Supabase.

## Desenvolvimento local

Pré-requisito: Node.js 22.

1. Copie `.env.example` para `.env`.
2. Preencha as variáveis públicas do projeto Supabase no arquivo local.
3. Execute `npm ci`.
4. Execute `npm run dev`.

Nunca use uma chave `service_role` no frontend.

## Validação

```text
npm run lint
npm run typecheck
npm test
npm run build
```

## Produção

O projeto usa npm e deve ser instalado de forma reproduzível com `npm ci`.

O deploy planejado usa Cloudflare Workers com assets estáticos. A configuração
versionada em `wrangler.jsonc`:

- mantém o Worker `mg-climatizacao-do-google-ia-studio`;
- serve o diretório gerado `dist`;
- entrega `index.html` como fallback de SPA para rotas como `/login` e `/admin`;
- passa as respostas pelo Worker em `worker/index.ts`, que aplica os cabeçalhos
  de segurança compatíveis com os recursos usados pela aplicação.

As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` são variáveis
públicas de compilação do Vite. Elas devem ser configuradas no ambiente de
build conectado ao GitHub; não são declaradas no `wrangler.jsonc`. Nunca use
uma chave `service_role` no frontend.

Validação local, sem publicar:

```text
npm run build
npm run deploy:check
npm run test:e2e
```

O manifesto utiliza ícones dedicados de 192×192, 512×512 e maskable derivados
da logo oficial. O Open Graph utiliza uma imagem dedicada de 1200×630.
