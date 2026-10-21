# Mapa de Estudos

Aplicativo de mapas mentais para estudo, no estilo do Xmind. Ele funciona sem internet depois de instalado e guarda os mapas no próprio aparelho. Os mapas são compartilhados como **pacotes** (arquivos `.mapas.json`) por WhatsApp, e-mail ou qualquer app de arquivos.

É uma pasta de arquivos estáticos, sem servidor, banco de dados ou etapa de build.

## O que ele faz

- Mapas com ramos orgânicos, tipos de tópico (conceito, definição, exemplo, fórmula, pergunta, importante), notas e situação de estudo (a revisar, estudando, dominado).
- **Modo lista** para ler o mapa como texto, pensado para o celular.
- **Treino com flashcards**: no toque, deslize o cartão (← errei, ↑ quase, → acertei).
- **Pacotes**: agrupe mapas na biblioteca e envie o pacote inteiro num único arquivo. Quando você manda uma versão nova, quem já tinha o pacote recebe o conteúdo atualizado e mantém as próprias marcações de estudo.
- Importa arquivos do Xmind (`.xmind`), Markdown, texto com recuo, OPML e backups do Mapa de Estudos. Isso inclui o backup `.json` exportado pela versão do claude.ai.
- Exporta imagem PNG, Markdown e backup da biblioteca.

## Telas por aparelho

| Aparelho | Largura | Como fica |
|---|---|---|
| Celular | até 640 px | Cabeçalho compacto, biblioteca em tela cheia, painel do tópico como folha que sobe de baixo, toque longo num tópico abre o menu, arrastar move o mapa |
| Tablet | 641 a 1100 px | Biblioteca e painel deslizam por cima do mapa, botões maiores para o dedo |
| Computador e tablet na horizontal | acima de 1100 px | Biblioteca e painel fixos nas laterais, atalhos de teclado |

## Publicar o app (uma vez)

O app precisa estar num endereço `https://` para poder ser instalado e funcionar sem internet. Qualquer hospedagem de arquivos estáticos serve. Publique **o conteúdo desta pasta**.

- **Vercel**: crie um projeto a partir deste repositório e defina *Root Directory* como `mapa-de-estudos`. Em *Framework Preset*, escolha *Other*. Não há comando de build.
- **Netlify**: arraste a pasta `mapa-de-estudos` para o painel de deploy manual.
- **GitHub Pages**: publique a pasta num repositório próprio, ou numa branch `gh-pages`.

O arquivo `vercel.json` já impede que o navegador guarde o `sw.js` antigo em cache.

## Instalar no celular ou tablet

Abra o endereço publicado com internet uma vez e depois:

- **iPhone e iPad (Safari)**: toque em Compartilhar → Adicionar à Tela de Início.
- **Android (Chrome)**: toque em Instalar app no aviso que aparece, ou no menu ⋮ → Instalar app.

A partir daí, o ícone **Mapas** abre o app mesmo sem conexão. Na biblioteca, a linha verde "Pronto para usar sem internet" confirma isso.

## Compartilhar pacotes

1. No menu ⋯ de cada mapa, use **Colocar num pacote**.
2. Na biblioteca, toque no ícone de compartilhar ao lado do nome do pacote. No celular abre o menu de compartilhamento (WhatsApp, e-mail…); no computador o arquivo é salvo para você anexar.
3. Para abrir o pacote:
   - **iPhone/iPad**: toque no arquivo recebido → Compartilhar → Salvar em Arquivos. No app, use Biblioteca → **Abrir**.
   - **Android**: com o app instalado, compartilhe o arquivo direto do WhatsApp para **Mapa de Estudos**, ou use Biblioteca → **Abrir**.

## Onde ficam os dados

Os mapas ficam no armazenamento do navegador do aparelho (IndexedDB). Eles não vão para nenhum servidor. Cada aparelho tem a sua biblioteca, e os pacotes são a forma de levar mapas de um para outro. Faça de vez em quando um **Backup da biblioteca** (menu Compartilhar), porque apagar os dados do navegador apaga os mapas.

## Atualizar o app depois de mudanças

Altere `VERSION` no começo do `sw.js` e publique de novo. Os aparelhos que já têm o app mostram o aviso "Nova versão do app pronta" com o botão **Atualizar**.

## Arquivos

- `index.html`, `styles.css`, `app.js`: o app
- `sw.js`: guarda o app para uso sem internet e recebe arquivos compartilhados no Android
- `manifest.webmanifest`, `icons/`: instalação na tela inicial
- `fonts/`: Newsreader, Figtree e IBM Plex Mono (SIL Open Font License), embutidas para funcionar sem internet
- `vendor/jszip.min.js`: JSZip 3.10.1 (MIT), para ler arquivos `.xmind`
