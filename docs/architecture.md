# Arquitetura

Modo integrado, conforme solution-contract.md. Knockout consome JSON-RPC 2.0 + Valibot na mesma origem. SSR contém conteúdo, metadados e navegação; o bundle próprio monta depois da hidratação.

Candidatos binários por linha/coluna, poda por prefixo e até cinco mil nós. Aceita qualquer grade que satisfaça todas as pistas. Só oferece dica forçada se a enumeração foi completa.

POST /api/rpc, JSON-RPC 2.0: {"jsonrpc":"2.0","method":"nonogram.check","params":INPUT,"id":1}. Sem lotes; notificações respondem 204.

service.mjs: domínio e exportação. input-schema.mjs: restrições canônicas. validator.mjs: validação da stack. api.mjs: protocolo/router. store.mjs: D1, tokens, CAS, TTL e cotas. transport.mjs: bytes/UTF-8, origem, erros mascarados e cabeçalhos.

