# Layer 3: Execution

Este diretório contém os scripts Python determinísticos que executam as tarefas.

**Objetivo:**
- O Agente de Orquestração (Layer 2) chamará essas ferramentas para realizar ações (acessar APIs, processar dados, interagir com bancos de dados, etc.).
- Códigos confiáveis, testáveis e rápidos.
- Variáveis de ambiente e tokens de API devem ser armazenados de forma segura no arquivo `.env`.

*Regra de Ouro: Scripts de execução são ferramentas reutilizáveis. Se algo falhar, o erro deve ser corrigido aqui, e a diretriz (Layer 1) atualizada com novos aprendizados.*
