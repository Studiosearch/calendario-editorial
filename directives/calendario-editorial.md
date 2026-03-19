# Calendário Editorial — SOP

## Objetivo
Gerenciar um calendário editorial de conteúdo para redes sociais, permitindo:
- Visualizar posts em calendário mensal
- Criar, editar e gerenciar status de posts
- Upload de artes (imagens/vídeos)
- Fluxo de aprovação pelo cliente
- Visualização em grid estilo Instagram (Perfil)

## Stack
- **Frontend**: React 19 + Vite
- **Persistência**: localStorage (sem backend)
- **Ícones**: Lucide React
- **Fontes**: Inter (Google Fonts)

## Como Rodar
```bash
cd execution/app
npm install
npm run dev
```

## Estrutura de Arquivos
```
execution/app/
├── src/
│   ├── components/       # Componentes React
│   │   ├── ApprovalDetailView.jsx
│   │   ├── ApprovalGridView.jsx
│   │   ├── ApprovalPage.jsx
│   │   ├── CalendarGrid.jsx
│   │   ├── CreatePostModal.jsx
│   │   ├── FilePreview.jsx
│   │   ├── PageHeader.jsx
│   │   ├── PostCard.jsx
│   │   ├── PostDetail.jsx
│   │   ├── PostDetailCreative.jsx
│   │   ├── PostDetailFooter.jsx
│   │   ├── PostDetailPlanning.jsx
│   │   └── ProfileView.jsx
│   ├── hooks/
│   │   └── usePosts.js   # Hook de dados (localStorage)
│   ├── constants.js      # Status, cores, opções
│   ├── App.jsx           # Componente raiz
│   ├── main.jsx          # Entry point
│   ├── index.css         # Estilos globais
│   └── theme-tokens.css  # CSS tokens
├── index.html
├── package.json
└── vite.config.js
```

## Fluxos Principais
1. **Calendário**: Visualização mensal com posts por dia
2. **Criar Post**: Botão + em cada dia → modal de criação
3. **Editar Post**: Clique no post → modal de detalhes com status, legenda, roteiro, plataformas
4. **Aprovação**: Botão "Encaminhar" → tela de grid para cliente aprovar/solicitar revisão
5. **Perfil**: Visualização em grid 3 colunas com preview rápido

## Dados
Dados seed são carregados na primeira execução. Tudo persiste via localStorage na chave `calendario-editorial-posts`.

## Edge Cases
- Se localStorage estiver corrompido, dados seed são recarregados
- Upload de arquivos usa URL.createObjectURL (não persiste entre sessões)
- Navegação de aprovação é via hash (#approval)
