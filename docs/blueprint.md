# **App Name**: Registro de Grupos de Ativos

## Core Features:

- Formulário de Informações do Grupo: Formulário com campos para: Nome do Grupo, Tipo de Grupo (Frota/Rota), Centro de Localização, Fase, Diretoria Executiva, Diretoria, Unidade e Categoria. Os dados serão obtidos da tabela 'hierarquia' no Supabase.
- Seleção Dinâmica de Ativos: Seletor de ativos: carrega dinamicamente os ativos da tabela 'ativos' onde o 'centro de localização' corresponde ao 'Centro de Localização' selecionado no formulário de informações do grupo.
- Submissão e Validação do Formulário: Submissão do formulário: valida os dados do formulário antes de enviar para o backend. Os dados devem ser mantidos temporariamente até que a conexão com o banco de dados seja estabelecida.

## Style Guidelines:

- Cor primária: Azul celeste profundo (#00BFFF). Captura uma sensação de confiança e céu claro, adequado para gerenciamento e visualização de dados em um contexto de mineração. Complementa os ambientes industriais sem ser sombrio.
- Cor de fundo: Ciano claro (#E0FFFF). Mantém uma sensação clara e arejada para evitar que o aplicativo pareça pesado.
- Cor de destaque: Cinza ardósia (#708090). Usado para botões secundários e elementos de IU menos cruciais. É uma cor análoga, garantindo uma aparência consistente, mas não monótona.
- Fonte do corpo e do título: 'Inter', sans-serif, fornecendo uma fonte moderna, neutra e legível, adequada para exibir dados estruturados.
- Use ícones claros e simples de uma biblioteca como FontAwesome para representar os tipos de ativos e categorias de grupo.
- Implemente um layout limpo, baseado em formulário, otimizando para entrada de dados eficiente.
- Animações de transição sutis (por exemplo, fade-ins, slide-ins) em atualizações de conteúdo dinâmico (lista de ativos) para melhorar a experiência do usuário.