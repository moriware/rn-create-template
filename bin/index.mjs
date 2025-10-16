#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import inquirer from 'inquirer';
import chalk from 'chalk';

const sleep = (ms = 450) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

async function progressStep(message, style = chalk.cyanBright, delay = 420) {
  console.log(style(`› ${message}`));
  await sleep(delay);
}

async function ensureDirectory(basePath, colorFn) {
  if (!fs.existsSync(basePath)) {
    await progressStep('Criando diretório base', colorFn);
    fs.mkdirSync(basePath, { recursive: true });
  } else {
    await progressStep('Diretório encontrado, atualizando arquivos', colorFn);
  }
}

async function generateFile(filePath, content, message, colorFn) {
  await progressStep(message, colorFn);
  fs.writeFileSync(filePath, content);
}

async function createIndexFile(basePath, name, type, colorFn) {
  const indexContent = `export * from './${name}${
    type === 'component' ? 'Component' : type === 'screen' ? 'Screen' : ''
  }';\nexport * from './${name}Types';\n`;
  await progressStep('Linkando exports em index.ts', colorFn);
  fs.writeFileSync(path.join(basePath, 'index.ts'), indexContent);
}

class ArtifactGenerator {
  constructor({
    label,
    color,
    resolveBasePath,
    buildFiles,
    indexType,
    successMessage,
  }) {
    this.label = label;
    this.color = color;
    this.resolveBasePath = resolveBasePath;
    this.buildFiles = buildFiles;
    this.indexType = indexType;
    this.successMessage = successMessage;
  }

  async generate(name) {
    const basePath = this.resolveBasePath(name);
    await ensureDirectory(basePath, this.color);

    const files = this.buildFiles(name);
    for (const file of files) {
      const filePath = path.join(basePath, file.filename);
      await generateFile(filePath, file.content, file.message, this.color);
    }

    if (this.indexType) {
      await createIndexFile(basePath, name, this.indexType, this.color);
    }

    console.log(this.successMessage(name));
  }
}

function buildComponentFiles(name) {
  const capitalized = capitalizeFirstLetter(name);
  return [
    {
      filename: `${name}Component.tsx`,
      message: 'Construindo componente principal',
      content: `import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './${name}Styles';
import type { ${name}Props } from './${name}Types';

export const ${capitalized}Component: React.FC<${name}Props> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text>{title ?? '${capitalized} Component'}</Text>
    </View>
  );
};
`,
    },
    {
      filename: `${name}Styles.ts`,
      message: 'Criando estilos base',
      content: `import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Customize styles here
  },
});
`,
    },
    {
      filename: `${name}Types.ts`,
      message: 'Tipando propriedades',
      content: `export interface ${name}Props {
  title?: string;
}
`,
    },
    {
      filename: `${name}Functions.ts`,
      message: 'Adicionando helpers utilitários',
      content: `// Utility functions for ${name}Component (if any)
export function exampleHelper() {
  return 'Hello from ${name}Functions';
}
`,
    },
    {
      filename: `${name}Component.test.tsx`,
      message: 'Escrevendo teste de renderização',
      content: `import React from 'react';
import { render } from '@testing-library/react-native';
import { ${capitalized}Component } from './${name}Component';

describe('${capitalized}Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<${capitalized}Component title="Test Title" />);
    expect(getByText('Test Title')).toBeTruthy();
  });
});
`,
    },
  ];
}

function buildScreenFiles(name) {
  const capitalized = capitalizeFirstLetter(name);
  return [
    {
      filename: `${name}Screen.tsx`,
      message: 'Construindo tela principal',
      content: `import React from 'react';
import { View, Text, Button } from 'react-native';
import { styles } from './${name}Styles';
import type { ${name}ScreenProps } from './${name}Types';

export const ${capitalized}Screen: React.FC<${name}ScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>${name} Screen</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};
`,
    },
    {
      filename: `${name}Styles.ts`,
      message: 'Criando estilos responsivos',
      content: `import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    // Customize styles aqui
  },
});
`,
    },
    {
      filename: `${name}Types.ts`,
      message: 'Tipando navegação',
      content: `import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface ${name}ScreenProps {
  navigation: NativeStackNavigationProp<any, any>;
}
`,
    },
    {
      filename: `${name}Functions.ts`,
      message: 'Semeando helpers exclusivos',
      content: `// Utility functions for ${name}Screen (if any)
export function screenHelper() {
  return 'Helper function for ${name}Screen';
}
`,
    },
    {
      filename: `${name}Screen.test.tsx`,
      message: 'Configurando teste de interação',
      content: `import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ${capitalized}Screen } from './${name}Screen';

const mockNavigation = { goBack: jest.fn() };

describe('${capitalized}Screen', () => {
  it('renders correctly and calls goBack on button press', () => {
    const { getByText } = render(<${capitalized}Screen navigation={mockNavigation as any} />);
    fireEvent.press(getByText('Go Back'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
`,
    },
  ];
}

function buildHookFiles(name) {
  const capitalized = capitalizeFirstLetter(name);
  return [
    {
      filename: `${name}.tsx`,
      message: 'Montando hook reativo',
      content: `import { useState, useEffect } from 'react';
import { Use${capitalized}Return } from './${name}Types';

export function use${capitalized}(): Use${capitalized}Return {
  const [state, setState] = useState<string>();

  useEffect(() => {
    // lógica do hook aqui
    setState('Olá do hook ${name}!');
  }, []);

  return [state, setState];
}
`,
    },
    {
      filename: `${name}Types.ts`,
      message: 'Definindo tipos reativos',
      content: `export type Use${capitalized}Return = [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>];
`,
    },
    {
      filename: `${name}.test.ts`,
      message: 'Escrevendo teste do hook',
      content: `import { renderHook, act } from '@testing-library/react-hooks';
import { use${capitalized} } from './${name}';

describe('use${capitalized}', () => {
  it('should initialize state and update correctly', () => {
    const { result } = renderHook(() => use${capitalized}());
    expect(result.current[0]).toBe(undefined);
    act(() => {
      result.current[1]('Teste');
    });
    expect(result.current[0]).toBe('Teste');
  });
});
`,
    },
  ];
}

function buildNavigationFiles(name) {
  const capitalized = capitalizeFirstLetter(name);
  return [
    {
      filename: `${capitalized}Navigation.tsx`,
      message: 'Montando stack navigator',
      content: `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ${capitalized}Screen } from '../screens/${name}';

const Stack = createNativeStackNavigator();

export function ${capitalized}Navigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="${capitalized}" component={${capitalized}Screen} />
    </Stack.Navigator>
  );
}
`,
    },
  ];
}

const GENERATORS = {
  component: new ArtifactGenerator({
    label: chalk.cyan('🎨 Component'),
    color: chalk.cyanBright,
    resolveBasePath: (name) =>
      path.join(process.cwd(), 'src', 'components', name),
    buildFiles: buildComponentFiles,
    indexType: 'component',
    successMessage: (name) =>
      chalk.greenBright.bold(
        `✨ Componente ${capitalizeFirstLetter(
          name,
        )} pronto em src/components/${name}`,
      ),
  }),
  screen: new ArtifactGenerator({
    label: chalk.magenta('📱 Screen'),
    color: chalk.magentaBright,
    resolveBasePath: (name) => path.join(process.cwd(), 'src', 'screens', name),
    buildFiles: buildScreenFiles,
    indexType: 'screen',
    successMessage: (name) =>
      chalk.greenBright.bold(
        `✨ Tela ${capitalizeFirstLetter(name)} pronta em src/screens/${name}`,
      ),
  }),
  hook: new ArtifactGenerator({
    label: chalk.green('🪝 Hook'),
    color: chalk.greenBright,
    resolveBasePath: (name) => path.join(process.cwd(), 'src', 'hooks', name),
    buildFiles: buildHookFiles,
    indexType: 'hook',
    successMessage: (name) =>
      chalk.greenBright.bold(
        `✨ Hook use${capitalizeFirstLetter(name)} pronto em src/hooks/${name}`,
      ),
  }),
  navigation: new ArtifactGenerator({
    label: chalk.yellow('🧭 Navigation'),
    color: chalk.yellowBright,
    resolveBasePath: () => path.join(process.cwd(), 'src', 'navigation'),
    buildFiles: buildNavigationFiles,
    successMessage: (name) =>
      chalk.greenBright.bold(
        `✨ Navegação ${capitalizeFirstLetter(
          name,
        )} pronta em src/navigation/${capitalizeFirstLetter(
          name,
        )}Navigation.tsx`,
      ),
  }),
};

function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowercaseFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toLowerCase() + string.slice(1);
}

async function handleCreationFlow(type, providedName) {
  const generator = GENERATORS[type];
  if (!generator) {
    throw new Error(`Tipo "${type}" não suportado.`);
  }

  const normalizedName = lowercaseFirstLetter(providedName.trim());
  await generator.generate(normalizedName);
  await progressStep('Voltando ao menu principal...', chalk.gray, 380);
}

async function showWelcome() {
  console.clear();
  const title = chalk.hex('#6C63FF').bold('React Native Create Template CLI');
  const subtitle = chalk
    .hex('#00C9A7')
    .italic('MoriWare - https://www.moriware.dev');

  console.log(chalk.gray('─────────────────────────────────────────────'));
  console.log(`  ${title}`);
  console.log(`  ${subtitle}`);
  console.log(chalk.gray('─────────────────────────────────────────────\n'));

  console.log(
    chalk.white(
      'Selecione uma opção no menu para gerar componentes, telas, hooks e navegação com todo carinho do design system.',
    ),
  );
  console.log(
    chalk.gray(
      'Dica: use nomes em lowerCamelCase que o resto a gente cuida pra você!\n',
    ),
  );
  await sleep(600);
}

async function main() {
  const args = process.argv.slice(2);
  const typeArg = args[0];
  const nameArg = args[1];
  const generatorTypes = Object.keys(GENERATORS);

  try {
    if (typeArg && nameArg && generatorTypes.includes(typeArg)) {
      await handleCreationFlow(typeArg, nameArg);
    } else if (typeArg && generatorTypes.includes(typeArg) && !nameArg) {
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Digite o nome:',
          validate: (value) =>
            value ? true : chalk.red('Digite um nome válido'),
        },
      ]);
      await handleCreationFlow(typeArg, name);
    } else {
      await showWelcome();
      let exitApp = false;

      while (!exitApp) {
        const { type } = await inquirer.prompt([
          {
            type: 'list',
            name: 'type',
            message: chalk.bold('O que deseja criar agora?'),
            choices: [
              ...generatorTypes.map((key) => ({
                name: GENERATORS[key].label,
                value: key,
              })),
              new inquirer.Separator(),
              {
                name: chalk.red('🚪 Sair'),
                value: 'exit',
              },
            ],
          },
        ]);

        if (type === 'exit') {
          exitApp = true;
          break;
        }

        const { name } = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: chalk.bold('Qual nome devemos usar?'),
            validate: (input) =>
              input ? true : chalk.red('Você precisa fornecer um nome válido.'),
          },
        ]);

        await progressStep('Respira... preparando tudo pra você.', chalk.gray);
        await handleCreationFlow(type, name);
      }

      console.log(
        chalk
          .bgHex('#1b1f3b')
          .white.bold(
            '\nObrigado por usar o RN Create Template! Até a próxima 👋\n',
          ),
      );
    }
  } catch (err) {
    if (err.name === 'ExitPromptError') {
      console.log(
        chalk.bgRed.bold('\nPrograma interrompido pelo usuário. Saindo...\n'),
      );
      process.exit(0);
    } else {
      throw err;
    }
  }
}

const isCliExecution = (() => {
  const argvPath = process.argv?.[1];
  if (!argvPath) {
    return false;
  }

  const currentFile = fs.realpathSync(fileURLToPath(import.meta.url));
  let invokedFile;

  try {
    invokedFile = fs.realpathSync(argvPath);
  } catch {
    invokedFile = path.resolve(argvPath);
  }

  return invokedFile === currentFile;
})();

if (isCliExecution) {
  main();
}

export {
  ArtifactGenerator,
  GENERATORS,
  buildComponentFiles,
  buildHookFiles,
  buildNavigationFiles,
  buildScreenFiles,
  capitalizeFirstLetter,
  createIndexFile,
  ensureDirectory,
  generateFile,
  handleCreationFlow,
  lowercaseFirstLetter,
  main,
  progressStep,
  showWelcome,
  sleep,
};
