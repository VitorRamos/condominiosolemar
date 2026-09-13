# Issues planejadas

## 1. Migrar autenticação do frontend para Supabase Auth

**Objetivo**

Remover a dependência do endpoint Express `/api/auth/login` no frontend publicado no GitHub Pages.

**Tarefas**

- [ ] Criar usuários no Supabase Auth.
- [ ] Substituir o login Axios por `supabase.auth.signInWithPassword`.
- [ ] Persistir e restaurar a sessão do Supabase.
- [ ] Implementar logout.
- [ ] Proteger as rotas privadas com a sessão atual.
- [ ] Remover o uso de JWT emitido pelo backend no frontend.

**Critérios de aceite**

- O login funciona no domínio do GitHub Pages sem `localhost:4000`.
- A sessão permanece ativa após recarregar a página.
- Usuários não autenticados não acessam o dashboard.
- Nenhuma chave `service_role`, `sb_secret` ou senha do banco aparece no frontend.

**Dependências**

- Configurar usuários no Supabase Auth.
- Definir a tabela de perfis/roles e suas políticas RLS.

---

## 2. Criar tabelas e políticas RLS no Supabase

**Objetivo**

Garantir que o frontend possa acessar os dados diretamente com segurança usando a chave pública do Supabase.

**Tarefas**

- [ ] Criar tabela de perfis vinculada a `auth.users`.
- [ ] Criar tabela de reclamações.
- [ ] Criar tabelas de imóveis e fotos.
- [ ] Criar tabelas de prestadores de serviços.
- [ ] Criar tabelas financeiras para administradores.
- [ ] Habilitar RLS em todas as tabelas públicas.
- [ ] Criar políticas de leitura pública para anúncios publicados.
- [ ] Criar políticas para cada usuário criar e consultar suas próprias reclamações.
- [ ] Criar políticas administrativas baseadas no perfil do usuário.

**Critérios de aceite**

- RLS está habilitado em todas as tabelas acessíveis pelo frontend.
- Usuários comuns não conseguem ler ou alterar dados administrativos.
- Administradores conseguem gerenciar os dados permitidos.
- Testes com a chave pública não permitem acesso sem autorização.

**Dependências**

- Issue 1: autenticação e sessão do Supabase.

---

## 3. Migrar reclamações para Supabase

**Objetivo**

Permitir que moradores enviem e consultem reclamações sem depender do backend Express.

**Tarefas**

- [ ] Substituir `POST /api/reclamacoes` por `supabase.from('reclamacoes').insert`.
- [ ] Associar cada reclamação ao usuário autenticado.
- [ ] Substituir listagem Axios por consulta Supabase.
- [ ] Ajustar mensagens de erro e estados de carregamento.
- [ ] Definir se o envio de e-mail será removido ou migrado para uma Edge Function.

**Critérios de aceite**

- Um morador autenticado consegue enviar uma reclamação.
- A reclamação aparece no Supabase com o autor correto.
- Um morador não consegue consultar reclamações de outros moradores, salvo regra definida.
- O fluxo funciona no GitHub Pages.

**Dependências**

- Issues 1 e 2.

---

## 4. Migrar dashboard e permissões para Supabase

**Objetivo**

Remover chamadas ao backend e manter o dashboard funcionando com autorização baseada em roles.

**Tarefas**

- [ ] Substituir a leitura do role no JWT próprio pelo perfil do Supabase.
- [ ] Migrar listagem e administração de usuários.
- [ ] Migrar imóveis e prestadores de serviços.
- [ ] Migrar lançamentos financeiros.
- [ ] Implementar estados de carregamento, sucesso e erro.
- [ ] Garantir que a interface esconda ações não permitidas.
- [ ] Manter a proteção real nas políticas RLS, sem depender apenas da interface.

**Critérios de aceite**

- O dashboard abre sem o backend local.
- Usuários visualizadores não conseguem executar operações administrativas.
- Administradores conseguem criar, editar e remover os registros autorizados.
- As operações são bloqueadas pelo Supabase quando o usuário não tem permissão.

**Dependências**

- Issues 1 e 2.

---

## 5. Publicar frontend Supabase no GitHub Pages

**Objetivo**

Publicar uma versão totalmente funcional do frontend sem depender de servidor Express local.

**Tarefas**

- [ ] Garantir que todas as chamadas Axios para `localhost:4000` sejam removidas ou substituídas.
- [ ] Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no processo de build.
- [ ] Manter os arquivos `.env.local` fora do Git.
- [ ] Executar `npm run build:pages`.
- [ ] Testar login, logout, reclamações e dashboard no domínio publicado.
- [ ] Confirmar que as rotas do React funcionam após atualização direta da página.
- [ ] Atualizar a documentação de publicação.

**Critérios de aceite**

- O site funciona no domínio do GitHub Pages sem backend local.
- O build não contém senha de banco nem chave secreta.
- Os fluxos principais funcionam em produção.
- O repositório contém apenas variáveis públicas e documentação segura.

**Dependências**

- Issues 1, 2, 3 e 4.
