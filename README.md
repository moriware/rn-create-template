<header>
<h1 align="center">
@moriware/rn-create-template
</h1>
<p align="center">
CLI para gerar componentes, telas, hooks e fluxos de navegação em projetos React Native com TypeScript
</p>
</header>

<h2>⚡️ Quick Start</h2>

Você pode disparar a CLI diretamente com `npx` (Node.js 18+ recomendado):

```bash
$ npx @moriware/rn-create-template
```

Precisa gerar algo específico em um único comando? Basta indicar o artefato:

```bash
$ npx @moriware/rn-create-template component MeuComponente
```

Quer manter o binário instalado ou adicionar scripts ao projeto? Veja a seção [🚀 Installation](#-installation).

<h2>🚀 Installation</h2>

> **Requisito de versão do Node**
>
> Recomendamos Node.js 18 ou superior para usar @moriware/rn-create-template. Utilize gerenciadores como [n](https://github.com/tj/n), [nvm](https://github.com/creationix/nvm) ou [nvm-windows](https://github.com/coreybutler/nvm-windows) para alternar versões rapidamente.

<h3>Global</h3>

Para instalar o pacote **globalmente**, execute um dos comandos abaixo (pode ser necessário `sudo`/admin dependendo de como o Node foi instalado):

```bash
$ npm install -g @moriware/rn-create-template
# OU
$ yarn global add @moriware/rn-create-template
```

Após a instalação, o binário `rn-create-template` fica disponível no terminal. Confira o menu de ajuda com:

```bash
$ rn-create-template --help
```

<h3>Instalação local</h3>

Para instalar o [`@moriware/rn-create-template`][1] **como dependência de desenvolvimento** no seu projeto:

```bash
$ npm install --save-dev @moriware/rn-create-template
# OU
$ yarn add @moriware/rn-create-template -D
```

Adicione um script ao `package.json` para facilitar o uso:

```json5
{
  scripts: {
    'rncreate': 'rn-create-template'
  }
}
```

Agora você pode rodar:

```bash
$ npm run rncreate component MeuComponente
# OU
$ yarn rncreate component MeuComponente
```

<h2>✨ Por que usar</h2>

- Cria estruturas completas com `Styles`, `Types`, `Tests` e `Utils`.
- Automatiza scaffolding sem abrir mão de padrões consistentes.
- Oferece prompts interativos com `inquirer` e feedback colorido com `chalk`.
- Mantém agilidade no seu fluxo de desenvolvimento React Native.

<h2>🧪 Uso</h2>

Execute `rn-create-template` e escolha o artefato que deseja gerar. O assistente interativo guia você por:

- Tipo do artefato (`component`, `screen`, `hook`, `navigation`).
- Nome do artefato (camelCase ou PascalCase) e outros detalhes conforme o tipo selecionado.

Prefere comandos diretos? Informe tudo na linha de comando:

```bash
$ rn-create-template component MeuComponente
```

Independente do modo, os arquivos são criados automaticamente nas pastas esperadas do seu projeto, já com estilos, tipos, testes e utilitários prontos para edição.

<h2>🤝 Créditos</h2>

Projeto idealizado pela **Moriware** e desenvolvido por **Caio Mori**. Ao utilizar o pacote, mantenha a atribuição conforme a licença.

<h2>📄 Licença</h2>

Distribuído sob a licença [MIT](LICENSE). Sinta-se à vontade para usar, modificar e distribuir, preservando a atribuição original.

[1]: https://www.npmjs.com/package/@moriware/rn-create-template
