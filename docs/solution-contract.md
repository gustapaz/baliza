# BALIZA · contrato integrado

portfolio-orchestrator coordena frontend-portfolio e backend-portfolio. Um repositório e uma origem HTTPS.

Produto: Jogo de nonogramas originais, validação de linhas e dicas pelo servidor. Front: Knockout; back: JSON-RPC 2.0 + Valibot; D1 real. Direção: Tabuleiro tipográfico de jornal, células com virada tridimensional e pistas que se confirmam na borda. Vinext somente como documento SSR e transporte Worker, com bundle independente para a interface. Dados sintéticos, algoritmo, validação e persistência reais. Sem serviços externos, cobrança, cartão ou trial.

Entidades: estudo com UUID, title 1–48 caracteres, input estritamente validado no domínio, result derivado, revision 1–30 e timestamps Unix seconds UTC. Token aleatório por recurso de 256 bits, somente digest persistido. Até 12 criações/hora UTC por demo, corpo JSON UTF-8 de 16 KiB, retenção de sete dias. Sessão desta aba guarda acesso de edição; URL de compartilhamento nunca contém token. Não há conta, envio de mensagens, pagamento ou dados pessoais necessários.

GET /api/catalog fornece parâmetros/presets; POST /api/compute calcula; POST /api/records cria privado com {title,input}; GET|PUT|DELETE /api/records/:id; PUT exige expected_revision. POST /api/records/:id/publish exige revisão e published boolean. GET /api/records/:id/export exporta a revisão salva com mesma autorização da leitura. Health e OpenAPI públicos. Protocolos específicos de cálculo serão documentados e testados quando escolhidos, preservando os endpoints de recursos. Compartilhar autoriza leitura pública; pode encerrar o link; não concede edição.

Erros {code,message,request_id}: 400 JSON/URL, 403 origem, 404 ausência/permissão, 409 revisão, 413 tamanho, 415 mídia/encoding, 422 domínio, 429 cota, 500 falha mascarada. Não substituir erro da API por mock silencioso.

Concluir: domínio, presets coerentes, edição por controles da interface, resultado textual e visual, salvar/reler/editar/compartilhar/exportar reais; falha significativa e recuperação; autorização cruzada, CAS, TTL, cotas, persistência ao reabrir runtime. Migrações D1 reais em teste isolado, sem reset de visitantes. Desktop/celular/tablet, teclado, pausa e movimento reduzido; demos públicas testadas, CI verde e somente gustapaz como contribuidor. Fechar abas e parar processos próprios após cada etapa.

Execução: npm ci; npm test; npm run typecheck; npm run check; npm run build; npm run db:migrate; npm start -- --port 59200. Hospedagem gratuita Sites/Worker/D1 sujeita a cotas e disponibilidade, sem promessa de SLA.

## Domínio e protocolo concretos

Candidatos binários por linha/coluna, poda por prefixo e até cinco mil nós. Aceita qualquer grade que satisfaça todas as pistas. Só oferece dica forçada se a enumeração foi completa.

POST /api/rpc, JSON-RPC 2.0: {"jsonrpc":"2.0","method":"nonogram.check","params":INPUT,"id":1}. Sem lotes; notificações respondem 204.
