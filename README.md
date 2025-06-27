# Shake To Go - Marketing Wheel

Uma aplicação de marketing com roleta interativa para a empresa Shake To Go, onde clientes podem girar uma roleta e ganhar prêmios.

## Funcionalidades

### Cliente
- Roleta interativa com animações suaves
- Modal de revelação de prêmio com estilo Pokemon
- Interface limpa seguindo a identidade visual da marca
- Responsivo para dispositivos móveis

### Painel Administrativo
- Cadastro de produtos com nome, imagem e probabilidade
- Gerenciamento de produtos ativos/inativos
- Controle de probabilidades (deve somar 100%)
- Interface intuitiva para CRUD de produtos

## Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: PostgreSQL
- **Containerização**: Docker Compose

## Como Executar

### 1. Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- Git

### 2. Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd shake-to-go-random

# Instale as dependências
npm install
```

### 3. Configuração do Banco de Dados

```bash
# Inicie o PostgreSQL com Docker
docker-compose up -d

# Gere o cliente Prisma
npm run db:generate

# Execute as migrações
npm run db:push
```

### 4. Execução

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em:
- **Cliente**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

## Estrutura do Projeto

```
src/
├── app/
│   ├── admin/           # Painel administrativo
│   ├── api/            # API routes
│   ├── globals.css     # Estilos globais
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Página inicial (roleta)
├── components/
│   ├── PrizeModal.tsx  # Modal de revelação do prêmio
│   └── SpinWheel.tsx   # Componente da roleta
└── lib/
    └── prisma.ts       # Configuração do Prisma
```

## Configuração da Marca

As cores da marca estão configuradas no `tailwind.config.js`:
- **Verde Primário**: #22c55e (primary-500)
- **Variações**: primary-50 até primary-900

## Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Aplicar schema ao banco
npm run db:studio    # Interface visual do banco
```

## Uso

### Para Administradores
1. Acesse `/admin`
2. Cadastre produtos com:
   - Nome do produto
   - URL da imagem (opcional)
   - Probabilidade de ganho (0-100%)
   - Status ativo/inativo
3. Certifique-se que a soma das probabilidades dos produtos ativos seja 100%

### Para Clientes
1. Acesse a página inicial
2. Clique em "GIRAR ROLETA!"
3. Aguarde a animação
4. Veja o prêmio ganho no modal
5. Apresente a tela no balcão para retirar o prêmio

## Banco de Dados

### Tabelas
- **products**: Produtos da roleta
- **spins**: Histórico de giros (para analytics)

### Campos dos Produtos
- `name`: Nome do produto
- `image`: URL da imagem
- `probability`: Probabilidade (0-100)
- `isActive`: Se está ativo na roleta

## Customização

Para personalizar a aparência:
1. Modifique as cores em `tailwind.config.js`
2. Ajuste os estilos em `src/app/globals.css`
3. Personalize os componentes em `src/components/`

## Produção

Para deploy em produção:
1. Configure as variáveis de ambiente
2. Execute `npm run build`
3. Configure um banco PostgreSQL
4. Execute `npm run start`