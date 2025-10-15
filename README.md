# @moriware/rn-create-template

Ferramenta CLI criada pela **Moriware** e desenvolvida por **Caio Mori** para acelerar a criação de componentes, telas, hooks e fluxos de navegação em projetos React Native com TypeScript.

## Por que usar?

- Cria estruturas completas com `Styles`, `Types`, `Tests` e `Utils`.
- Automatiza scaffolding sem abrir mão de padrões consistentes.
- Oferece prompts interativos com `inquirer` e feedback colorido com `chalk`.
- Rapidez em seu fluxo de desenvolvimento.

## Instalação

### Instalação global (uso direto)

```bash
npm install -g @moriware/rn-create-template
```

Ou use via `npx` sem instalar globalmente:

```bash
npx @moriware/rn-create-template
```

### Uso como dependência de desenvolvimento local

Se preferir adicionar como dependência de desenvolvimento no seu projeto React Native:

```bash
yarn add -D @moriware/rn-create-template
# ou
npm install --save-dev @moriware/rn-create-template
```

Depois, adicione um script no seu `package.json` para facilitar o uso:

```json
"scripts": {
  "rncreate": "rn-create-template",
}
```

Assim, você pode rodar comandos como:

```bash
yarn rncreate component MeuComponente
# ou
npm run rncreate component MeuComponente
```

## Uso

Execute o comando e escolha o artefato que deseja gerar:

O fluxo interativo guia você por:

- Tipo do artefato (`component`, `screen`, `hook`, `navigation`).
- Nome do artefato (camelCase ou PascalCase).

Os arquivos são criados automaticamente dentro das pastas esperadas do seu projeto, prontos para edição.

### Exemplos rápidos

Criar componente direto no terminal:

```bash
npx @moriware/rn-create-template component MeuComponente
```

Criar tela com prompt interativo:

```bash
npx @moriware/rn-create-template
```

## Créditos

Este projeto foi idealizado pela **Moriware** e desenvolvido por **Caio Mori**. Se você usar o pacote, mantenha a atribuição à Moriware e ao Caio em seus créditos.

## Licença

Distribuído sob a licença [MIT](LICENSE). Você é livre para usar, modificar e distribuir, desde que preserve a atribuição original.
