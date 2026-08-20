\# AGENTS.md — MG Climatização



\## 1. Objetivo deste arquivo



Este arquivo contém as regras permanentes para qualquer agente de IA que trabalhe neste repositório.



Leia este arquivo antes de planejar ou modificar o projeto.



Prioridades, nesta ordem:



1\. Preservar funcionalidades existentes.

2\. Preservar segurança e integridade dos dados.

3\. Não inventar informações sobre a empresa.

4\. Manter excelente experiência mobile.

5\. Manter identidade visual consistente.

6\. Produzir código simples, legível e sustentável.

7\. Validar alterações com testes, typecheck e build.



Não altere partes não relacionadas ao pedido atual apenas porque seria possível "melhorá-las".



\---



\# 2. Projeto



Projeto: MG Climatização



Aplicação web corporativa para serviços de climatização em Blumenau e região.



Stack principal:



\- React

\- TypeScript

\- Vite

\- Supabase

\- Supabase Auth

\- PostgreSQL

\- Supabase Storage

\- Tailwind CSS / CSS existente no projeto

\- Vitest



A aplicação possui conteúdo público e área administrativa.



Antes de realizar alterações, inspecione a implementação existente. Não presuma a arquitetura apenas com base neste documento.



\---



\# 3. Regra fundamental de escopo



Faça somente alterações necessárias para cumprir a tarefa solicitada.



Não aproveite uma tarefa para:



\- reestruturar arquivos sem necessidade;

\- trocar bibliotecas;

\- alterar arquitetura;

\- modificar banco;

\- mudar textos;

\- alterar regras de negócio;

\- remover funcionalidades;

\- adicionar funcionalidades;

\- redesenhar componentes fora do escopo.



Se descobrir um problema importante fora do escopo, informe-o no relatório final em vez de corrigi-lo silenciosamente.



Para mudanças grandes:



1\. analise o estado atual;

2\. identifique arquivos envolvidos;

3\. defina um plano;

4\. implemente;

5\. valide;

6\. revise o diff final.



\---



\# 4. Fonte autoritativa de dados



O Supabase é a fonte autoritativa dos conteúdos dinâmicos utilizados pelo site.



Isso inclui, conforme a implementação existente:



\- serviços;

\- FAQ;

\- portfólio;

\- antes e depois;

\- depoimentos;

\- configurações;

\- usuários administrativos;

\- imagens armazenadas no Storage.



Não introduza dados locais concorrentes com o Supabase.



Não crie fallbacks contendo dados empresariais fictícios apenas para preencher a interface.



Se o Supabase estiver vazio, prefira um estado vazio adequado.



\---



\# 5. Supabase e segurança



Preserve:



\- Supabase Auth;

\- RLS;

\- policies;

\- public.is\_admin();

\- public.admin\_users;

\- Storage;

\- relacionamentos existentes;

\- validações;

\- regras de acesso administrativo.



NÃO execute ou proponha silenciosamente alterações remotas destrutivas.



Não faça sem autorização explícita:



\- DELETE remoto;

\- DROP;

\- TRUNCATE;

\- alterações de RLS;

\- alterações de policies;

\- alterações de admin\_users;

\- mudanças em Auth;

\- alterações estruturais no banco;

\- exclusão de arquivos no Storage;

\- migrações destrutivas.



Se uma tarefa exigir mudança de dados remotos, explique exatamente o que precisa ser alterado antes da execução quando houver risco relevante.



Nunca enfraqueça segurança para fazer uma funcionalidade funcionar.



Nunca desative RLS como solução para um problema.



\---



\# 6. Área administrativa



A área administrativa deve continuar protegida.



Não transforme simplesmente um usuário autenticado em administrador.



A autorização administrativa deve continuar baseada na arquitetura existente do projeto, especialmente admin\_users/is\_admin quando aplicável.



Não introduza:



\- listas de e-mails administrativos hardcoded;

\- senhas no frontend;

\- bypass de autenticação;

\- permissões administrativas baseadas apenas em localStorage;

\- service\_role key no frontend.



Nunca exponha segredos do Supabase.



---



\# 7. Imagens e uploads



Preserve a integração existente com Supabase Storage.



Não:



\- armazene imagens em Base64 no banco;

\- coloque service\_role key no cliente;

\- remova validações de upload;

\- enfraqueça validações de URL;

\- remova proteções de caminhos;

\- altere compressão de imagens sem necessidade.



Mudanças visuais não devem quebrar upload, exclusão ou exibição de imagens.



\---



\# 8. Informações oficiais da MG Climatização



Use somente informações confirmadas.



Empresa:

MG Climatização



Profissional responsável:

Marcos Manerich



Área:

Climatização e refrigeração.



Região:

Blumenau e região.



Texto seguro para cobertura:

"Atendemos Blumenau e região. Dependendo da localização, pode haver taxa adicional de deslocamento."



Serviços confirmados:



\- instalação;

\- manutenção preventiva;

\- manutenção corretiva;

\- higienização;

\- diagnóstico de defeitos;

\- correção de vazamentos;

\- carga de gás / carga de fluido refrigerante;

\- desinstalação;

\- atendimento residencial;

\- atendimento empresarial;

\- venda de equipamentos;

\- trabalho em altura.



A MG Climatização realiza carga de gás/fluido refrigerante.

Não especificar o tipo de fluido utilizado sem confirmação.



Há atuação em trabalho em altura/rapel quando aplicável ao serviço.



Formas de pagamento confirmadas:



\- Pix;

\- dinheiro;

\- cartão de crédito;

\- cartão de débito.



A empresa emite Nota Fiscal.



Garantia informada:

90 dias nos serviços.



Nunca substituir por "1 ano", "12 meses" ou outra duração.



Atendimento emergencial:

mediante solicitação e disponibilidade.



Nunca anunciar atendimento 24 horas ou 24/7 sem confirmação.



\---



\# 9. Informações que NÃO devem ser inventadas



Não publique afirmações técnicas, jurídicas ou comerciais sem comprovação.



Especialmente não invente ou reintroduza:



\- PMOC;

\- contrato PMOC;

\- ART;

\- TRT;

\- laudos técnicos;

\- responsabilidade técnica não comprovada;

\- vínculo com CREA;

\- vínculo com CFT;

\- vínculo com CRT;

\- autorização da ANVISA;

\- garantia de 1 ano;

\- garantia de 12 meses;

\- atendimento 24h;

\- atendimento 24/7;

\- marcas ou tipos específicos de fluido refrigerante;

\- R-410A;

\- R-32;

\- outros fluidos específicos sem confirmação;

\- preço da carga de gás;

\- quantidade de fluido utilizada;

\- troca de capacitores;

\- troca de placas;

\- uso de bactericida;

\- alegações médicas;

\- alegações de eliminação garantida de bactérias, fungos ou doenças;

\- números ou estatísticas sem fonte;

\- preços;

\- descontos;

\- parcelamento;

\- certificações não confirmadas;

\- anos de experiência não confirmados.

\-  não anunciar venda de produtos sob encomenda;

\- a venda confirmada refere-se a equipamentos de ar-condicionado.



Se encontrar essas informações em conteúdo antigo, não assuma que são verdadeiras.



Sinalize a ocorrência e, quando a tarefa permitir, substitua por linguagem geral baseada apenas nos serviços confirmados.



\---



\# 10. Qualificações



Existe informação de curso de Refrigeração e Climatização concluído em 2026, com carga horária informada de 40 horas e certificado.



Existe informação de capacitação NR-35 válida e certificado.



Entretanto, não transforme essas informações em títulos profissionais, registros de conselho ou habilitações que não tenham sido comprovadas.



Não use expressões como:



\- engenheiro;

\- responsável técnico registrado;

\- técnico registrado no conselho;

\- especialista certificado por órgão X;



a menos que haja comprovação explícita.



Quando o design não exigir esses detalhes, prefira comunicação institucional mais simples.



\---



\# 11. Orçamento e simulador



REGRA IMPORTANTE:



O site NÃO deve calcular, prometer ou apresentar preço final ao cliente.



O valor do serviço/orçamento será combinado diretamente com o cliente pelo WhatsApp.



O simulador deve funcionar como uma ferramenta para coletar a necessidade do cliente e organizar as informações antes do contato.



Ele pode coletar informações relevantes sobre o atendimento, incluindo:



\- nome completo do cliente;

\- endereço onde o serviço será realizado;

\- cidade;

\- tipo de serviço desejado;

\- informações do equipamento;

\- quantidade de equipamentos, quando aplicável;

\- demais informações necessárias para entender a solicitação.



Os campos de identificação e localização devem ter nomes claros, por exemplo:



\- "Nome completo";

\- "Endereço do serviço";

\- "Cidade".



Não solicitar informações pessoais que não sejam necessárias para o atendimento.



Nome, endereço e cidade devem ser utilizados apenas para compor a solicitação enviada ao WhatsApp, salvo se existir uma funcionalidade explicitamente aprovada para armazenamento desses dados.



Não criar armazenamento desses dados no Supabase, localStorage ou outro sistema sem autorização explícita.



No final do fluxo, apresentar um resumo das informações fornecidas pelo cliente e permitir que ele envie a solicitação para o WhatsApp.



Exemplo de estrutura da mensagem:



Olá! Gostaria de solicitar um orçamento.



Nome: \[nome informado]

Endereço do serviço: \[endereço informado]

Cidade: \[cidade informada]

Serviço: \[serviço selecionado]

Equipamento: \[informações coletadas]

Quantidade: \[quantidade, quando aplicável]



Gostaria de conversar sobre o atendimento e o valor do serviço.



Não:



\- mostrar preço estimado;

\- mostrar preço final;

\- inventar tabela de valores;

\- prometer desconto;

\- chamar uma estimativa fictícia de orçamento definitivo;

\- armazenar dados pessoais sem necessidade;

\- solicitar dados pessoais desnecessários.



Prefira nomenclaturas como:



\- "Montar solicitação";

\- "Solicitar orçamento";

\- "Informar o serviço";

\- "Simular serviço";



quando forem mais coerentes que "simular preço".



Preserve a lógica funcional existente que ainda seja necessária para coletar os dados.



Ao modificar o simulador, não alterar Supabase, autenticação, painel administrativo ou outras funcionalidades não relacionadas sem necessidade.

\---



\# 12. WhatsApp



O WhatsApp é um dos principais canais de conversão.



Número central atualmente definido para o projeto:



5547997464218



Não espalhe números duplicados hardcoded se já existir utilitário/configuração central.



Reutilize a função/configuração central existente para gerar links quando possível.



As mensagens devem:



\- ser curtas;

\- ser claras;

\- identificar o serviço solicitado;

\- não incluir preço fictício;

\- não reutilizar dados antigos de outra solicitação.



Preserve encodeURIComponent ou mecanismo equivalente de encoding.



\---



\# 13. Domínio



Domínio oficial informado:



https://mgclimabnu.com.br/



Ao trabalhar com:



\- canonical;

\- Open Graph;

\- Twitter metadata;

\- Schema.org;

\- sitemap;

\- robots.txt;



utilize esse domínio.



Não reintroduza:



https://mgclimatizacao.com.br/



\---



\# 14. Identidade visual oficial da MG Climatização



Os arquivos oficiais de marca e referências visuais estão em:



\- `public/brand/logo-principal.jpg`

\- `public/brand/referencias/identidade-visual-principal.jpg`

\- `public/brand/referencias/higienizacao-referencia.jpg`



Antes de realizar alterações relevantes de UI, layout, cores ou identidade

visual, consulte esses arquivos.



\## Logo oficial



`public/brand/logo-principal.jpg`



Esta é a principal logo oficial disponível no projeto.



Ao exibir a marca MG Climatização no Header, Footer ou outras áreas

institucionais, priorize este arquivo.



Não substituir a logo por:

\- ícones genéricos;

\- logos recriadas em CSS;

\- texto tentando imitar a logo;

\- símbolos de climatização genéricos;

\- versões inventadas da marca.



Não distorcer, redesenhar ou alterar as proporções da logo.



\## Referência visual principal



`public/brand/referencias/identidade-visual-principal.jpg`



Esta é a PRINCIPAL referência para decisões de design.



O objetivo NÃO é copiar o banner literalmente para o site.



Use-o para compreender e reproduzir a linguagem visual da marca:



\- fundo navy profundo;

\- branco como contraste principal;

\- azul/ciano relacionado à climatização;

\- laranja como contraste quente;

\- iluminação azul e laranja;

\- linhas/ondas que remetem a fluxo de ar;

\- alto contraste;

\- aparência moderna e profissional;

\- títulos fortes;

\- composição limpa e marcante.



Ao existir dúvida sobre a direção estética do site, esta imagem deve ter

prioridade sobre interpretações subjetivas da identidade visual.



\## Referência visual secundária



`public/brand/referencias/higienizacao-referencia.jpg`



Utilize esta imagem para compreender como a identidade pode ser aplicada

em elementos menores da interface, como:



\- cards;

\- bordas;

\- ícones;

\- títulos;

\- chamadas de atenção;

\- CTAs;

\- blocos informativos;

\- contraste entre navy, azul, branco e laranja.



Ela é uma referência ESTÉTICA, não uma fonte de informações comerciais,

técnicas ou médicas para o site.



Não copie automaticamente textos, afirmações, períodos de manutenção,

benefícios de saúde ou outras informações presentes na arte.



\## Hierarquia das cores



A identidade da MG Climatização NÃO é predominantemente laranja e NÃO é

predominantemente azul-claro.



A base visual deve ser:



1\. Navy profundo — estrutura, fundos e identidade principal.

2\. Branco — texto, contraste e áreas de respiro.

3\. Azul/ciano — climatização, tecnologia, ícones e elementos frios.

4\. Laranja — destaque estratégico e contraste.



Azul/ciano e laranja devem coexistir de forma planejada.



NÃO espalhar laranja aleatoriamente apenas para fazer a cor aparecer.



Evitar:

\- uma palavra laranja sem motivo;

\- um check laranja isolado;

\- bordas laranja aleatórias;

\- ícones laranja sem padrão;

\- diferentes cores de CTA sem hierarquia;

\- excesso de gradientes.



Cada cor deve possuir função consistente no design system.



\## Consistência global



Mudanças de identidade visual devem considerar o site como um sistema

completo, e não componentes isolados.



Header, Hero, Serviços, Sobre, Simulador, Antes e Depois, Portfólio, FAQ,

Contato e Footer devem parecer partes do MESMO produto.



Antes de finalizar um redesign:



1\. comparar o resultado com `identidade-visual-principal.jpg`;

2\. verificar consistência de cores;

3\. verificar consistência dos CTAs;

4\. verificar tipografia e espaçamento;

5\. verificar desktop e mobile;

6\. garantir que o laranja não tenha sido aplicado aleatoriamente;

7\. garantir que a logo oficial esteja sendo utilizada corretamente.

\---



\# 15. Identidade visual



A identidade da MG utiliza principalmente:



\- azul-marinho/navy;

\- azul/ciano;

\- branco;

\- laranja.



IMPORTANTE:



Laranja é uma cor de destaque da marca, não uma cor para ser espalhada aleatoriamente.



Não aplique laranja isoladamente em palavras, checks, bordas ou ícones sem uma regra visual consistente.



Defina tokens de design centralizados sempre que possível.



Exemplo conceitual:



\- navy: estrutura e fundos escuros;

\- branco/cinza muito claro: superfícies claras;

\- azul/ciano: climatização, elementos frios e elementos secundários;

\- laranja: CTA principal e pontos estratégicos da marca.



Uma mesma categoria de componente deve seguir a mesma regra de cor.



Não criar dezenas de variações de azul ou laranja sem necessidade.



\---



\# 16. Logo



Utilize a logo oficial existente nos assets do projeto.



Antes de definir o caminho, confirme qual arquivo é efetivamente a logo oficial.



Não substitua a marca por:



\- ícone genérico de ar-condicionado;

\- emoji;

\- ícone Lucide;

\- iniciais recriadas em CSS;

\- logo fictícia.



Preserve a proporção da logo.



Use object-fit apropriado e evite distorção.



Header, Hero e Footer devem utilizar a mesma identidade oficial quando a logo estiver presente.



\---



\# 17. Hero



O Hero deve ser impactante, porém simples.



Prioridade:



1\. marca;

2\. mensagem principal;

3\. explicação curta;

4\. CTA;

5\. imagem;

6\. prova de confiança somente quando necessária.



Evite acumular simultaneamente:



\- muitos badges;

\- quatro ou mais indicadores;

\- múltiplos selos;

\- textos repetidos;

\- vários CTAs equivalentes;

\- elementos decorativos competindo com o H1.



A mensagem "Conforto em cada detalhe" pode servir como referência de identidade quando estiver de acordo com a tarefa atual.



Não destaque palavras aleatoriamente em várias cores.



Se houver destaque cromático no H1, ele deve seguir uma regra visual clara.



\---



\# 18. Mobile-first



Mobile é prioridade.



Toda mudança visual relevante deve considerar pelo menos:



\- 320px;

\- 360px;

\- 375px;

\- 390px;

\- 430px;



e também desktop.



Evite:



\- overflow horizontal;

\- textos cortados;

\- botões fora da tela;

\- elementos sobrepostos;

\- cards apertados;

\- fonte ilegível;

\- áreas de toque pequenas;

\- imagens deformadas.



CTAs importantes devem ser confortáveis para toque.



Use safe-area quando necessário para elementos fixos.



Não considere uma alteração visual concluída apenas porque funciona em desktop.



\---



\# 19. Acessibilidade



Preserve ou melhore:



\- HTML semântico;

\- labels;

\- aria-label;

\- aria-expanded;

\- aria-pressed;

\- foco de teclado;

\- contraste;

\- navegação por teclado;

\- alt de imagens;

\- estados disabled;

\- feedback de loading e erro.



Não remova atributos de acessibilidade apenas para simplificar JSX.



\---



\# 20. Conteúdo dinâmico



Não duplique conteúdo do Supabase em arquivos locais sem necessidade.



Se uma seção é administrável pelo painel, o painel/Supabase deve continuar sendo a fonte de verdade.



Conteúdo institucional realmente estático pode permanecer no código quando fizer sentido.



Evite duas fontes concorrentes para o mesmo conteúdo.



\---



\# 21. Estados da interface



Toda área dependente de dados remotos deve considerar:



\- loading;

\- sucesso;

\- vazio;

\- erro.



Não esconda erros silenciosamente usando conteúdo fictício.



Prefira mensagens simples e opção de tentar novamente quando apropriado.



\---



\# 22. Performance



Evite adicionar dependências sem necessidade.



Antes de instalar um pacote, verifique se:



\- a funcionalidade já existe no projeto;

\- pode ser feita com React/CSS;

\- uma dependência existente já resolve o problema.



Não adicione biblioteca apenas para um efeito visual simples.



Preserve otimizações existentes de imagens e bundle.



\---



\# 23. Dependências



Não remova ou atualize dependências em massa durante tarefas que não sejam especificamente sobre dependências.



Não faça major upgrades automaticamente.



Mudanças de package.json devem ter justificativa clara.



\---



\# 24. Variáveis de ambiente



Nunca:



\- exponha secrets;

\- coloque service\_role key no frontend;

\- commite credenciais privadas;

\- substitua variáveis seguras por valores hardcoded.



Respeite .env e .env.example existentes.



Se encontrar segredo aparentemente commitado, sinalize o problema.



\---



\# 25. Git



Antes de mudanças grandes, observe o estado atual do repositório quando possível.



Não:



\- faça force push;

\- apague branches;

\- reescreva histórico;

\- descarte alterações do usuário;

\- execute reset --hard sem autorização.



Não reverta alterações existentes apenas porque não foram feitas por você.



Mantenha o diff focado no escopo.



\---



\# 26. Deploy



O projeto poderá ser versionado no GitHub e publicado através de pipeline/deploy integrado ao Cloudflare.



Não altere configurações de deploy sem necessidade.



Não presuma que a versão atualmente publicada é a mesma versão local.



Build local bem-sucedido não significa automaticamente que produção foi publicada.



\---



\# 27. Testes e validação



Após mudanças relevantes, execute os comandos disponíveis no projeto.



Preferencialmente:



npm run lint



npx vitest run



npm run build



Se package.json definir comandos diferentes, siga package.json.



REGRA ABSOLUTA:



Nunca diga que um teste passou se ele não foi realmente executado.



Nunca invente:



\- número de testes;

\- número de arquivos;

\- resultado de lint;

\- resultado de build;

\- cobertura.



Se não foi possível executar, diga explicitamente.



\---



\# 28. Testes existentes



Não altere testes apenas para fazer uma implementação incorreta passar.



Se um teste falhar:



1\. entenda a causa;

2\. determine se houve regressão;

3\. corrija a implementação quando apropriado.



Só altere um teste quando o comportamento esperado realmente tiver mudado de forma intencional.



\---



\# 29. Processo para redesigns



Para redesign significativo:



\### Etapa 1 — Auditoria



Analise:



\- tokens existentes;

\- cores hardcoded;

\- tipografia;

\- espaçamento;

\- Header;

\- Hero;

\- Serviços;

\- Sobre;

\- Simulador;

\- Antes/Depois;

\- Portfólio;

\- FAQ;

\- Contato;

\- Footer;

\- mobile.



\### Etapa 2 — Sistema visual



Defina regras consistentes para:



\- cores;

\- backgrounds;

\- tipografia;

\- radius;

\- sombras;

\- bordas;

\- botões;

\- cards;

\- badges;

\- espaçamento.



\### Etapa 3 — Implementação



Aplique o sistema de maneira consistente.



Não faça cada seção parecer pertencer a um site diferente.



\### Etapa 4 — Validação



Confira:



\- desktop;

\- mobile;

\- contraste;

\- overflow;

\- estados interativos;

\- conteúdo;

\- testes;

\- build.



\---



\# 30. Regra contra "design aleatório"



Nunca resolva um pedido como "adicione mais laranja" simplesmente adicionando laranja em elementos aleatórios.



Antes:



1\. determine o papel daquela cor no design system;

2\. identifique quais componentes pertencem àquela categoria;

3\. aplique a regra consistentemente;

4\. revise o resultado global.



O mesmo vale para azul, ciano, sombras, gradients e animações.



Consistência global > decoração local.



\---



\# 31. Revisão obrigatória antes de concluir



Depois de uma alteração grande, faça uma revisão do próprio diff.



Procure:



\- regressões;

\- código morto;

\- imports não utilizados;

\- estilos duplicados;

\- cores hardcoded desnecessárias;

\- textos antigos;

\- informações empresariais não confirmadas;

\- problemas mobile;

\- mudanças fora do escopo;

\- problemas de acessibilidade;

\- quebra de integração com Supabase;

\- quebra do WhatsApp.



Corrija problemas introduzidos pela própria alteração antes de concluir.



\---



\# 32. Busca por conteúdo legado



Quando a tarefa envolver limpeza institucional ou redesign amplo, procure por conteúdo antigo potencialmente incorreto.



Termos importantes para auditoria:



\- PMOC

\- ART

\- ANVISA

\- CREA

\- CFT

\- CRT

\- 1 ano

\- 12 meses

\- R-410A

\- R-32

\- bactericida

\- capacitores

\- placas

\- 24h

\- 24/7

\- preço

\- valor estimado



A presença de um termo não significa automaticamente que deve ser removido de código técnico.



Analise o contexto antes.



Em conteúdo público da empresa, não publique alegações não confirmadas.



\---



\# 33. Comunicação ao finalizar uma tarefa



O relatório final deve ser factual e curto.



Informe:



\- o que foi alterado;

\- quais arquivos principais foram modificados;

\- decisões importantes;

\- testes realmente executados;

\- resultado real do build;

\- pendências ou riscos encontrados.



Não escreva "100% seguro", "perfeitamente funcional", "sucesso absoluto" ou afirmações equivalentes sem evidência suficiente.



Não diga que áreas não testadas estão funcionando perfeitamente.



\---



\# 34. Quando houver dúvida



Se uma decisão puder:



\- alterar dados;

\- enfraquecer segurança;

\- mudar uma regra comercial;

\- publicar informação não confirmada;

\- remover funcionalidade importante;

\- alterar infraestrutura;



não adivinhe.



Investigue primeiro.



Se ainda houver ambiguidade relevante, solicite confirmação.



Para decisões puramente internas e reversíveis de implementação, use julgamento técnico e continue sem interromper desnecessariamente o trabalho.



\---



\# 35. Princípio final



O objetivo não é modificar a maior quantidade possível de código.



O objetivo é entregar a menor mudança necessária que produza uma melhoria real, consistente, segura e verificável.



Preserve o que já funciona.



Simplifique quando possível.



Não invente.



Teste o que alterar.



\---



\# 36. Identidade visual da MG Climatização



A identidade visual oficial está documentada em:



BRAND\_GUIDE.md



Os assets e referências visuais estão em:



public/brand/



Para qualquer tarefa que envolva design, cores, logo, layout,

tipografia, componentes visuais ou redesign:



1\. leia BRAND\_GUIDE.md;

2\. inspecione os assets em public/brand/;

3\. utilize-os como referência antes de alterar a interface.



Não invente uma identidade visual diferente da marca.

