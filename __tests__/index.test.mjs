import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import inquirer from 'inquirer';

const moduleUnderTest = await import('../bin/index.mjs');

const {
  sleep,
  progressStep,
  ensureDirectory,
  generateFile,
  createIndexFile,
  ArtifactGenerator,
  buildComponentFiles,
  buildScreenFiles,
  buildHookFiles,
  buildNavigationFiles,
  capitalizeFirstLetter,
  lowercaseFirstLetter,
  handleCreationFlow,
  showWelcome,
  main,
  GENERATORS,
} = moduleUnderTest;

const originalGenerators = {
  component: GENERATORS.component,
  screen: GENERATORS.screen,
  hook: GENERATORS.hook,
  navigation: GENERATORS.navigation,
};

const originalArgv = [...process.argv];


beforeAll(() => {
  chalk.level = 0;
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
  GENERATORS.component = originalGenerators.component;
  GENERATORS.screen = originalGenerators.screen;
  GENERATORS.hook = originalGenerators.hook;
  GENERATORS.navigation = originalGenerators.navigation;
  process.argv = [...originalArgv];
});

describe('sleep', () => {
  it('resolves after the specified delay', async () => {
    jest.useFakeTimers();
    const promise = sleep(500);
    jest.advanceTimersByTime(500);
    await expect(promise).resolves.toBeUndefined();
  });
});

describe('progressStep', () => {
  it('logs the styled message and waits for sleep', async () => {
    jest.useFakeTimers();
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const styleMock = jest.fn((value) => value.toUpperCase());

    const promise = progressStep('fazendo magia', styleMock, 123);

    expect(styleMock).toHaveBeenCalledWith('› fazendo magia');
    expect(logSpy).toHaveBeenCalledWith('› fazendo magia'.toUpperCase());

    jest.advanceTimersByTime(123);
    await promise;
  });
});

describe('ensureDirectory', () => {
  it('creates the directory when it does not exist', async () => {
    const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    const mkdirSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await ensureDirectory('/tmp/new-dir', chalk.white);

    expect(logSpy).toHaveBeenCalledWith('› Criando diretório base');
    expect(mkdirSpy).toHaveBeenCalledWith('/tmp/new-dir', { recursive: true });
    expect(existsSpy).toHaveBeenCalledWith('/tmp/new-dir');
  });

  it('acknowledges existing directory without recreating it', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const mkdirSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await ensureDirectory('/tmp/existing-dir', chalk.white);

    expect(logSpy).toHaveBeenCalledWith('› Diretório encontrado, atualizando arquivos');
    expect(mkdirSpy).not.toHaveBeenCalled();
  });
});

describe('generateFile', () => {
  it('writes the file after showing progress', async () => {
    const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await generateFile('/tmp/file.ts', 'conteúdo', 'Mensagem', chalk.white);

    expect(logSpy).toHaveBeenCalledWith('› Mensagem');
    expect(writeSpy).toHaveBeenCalledWith('/tmp/file.ts', 'conteúdo');
  });
});

describe('createIndexFile', () => {
  it('writes index file according to the artifact type', async () => {
    const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await createIndexFile('/tmp/components/sample', 'sample', 'component', chalk.white);

    expect(logSpy).toHaveBeenCalledWith('› Linkando exports em index.ts');
    expect(writeSpy).toHaveBeenCalledWith(
      path.join('/tmp/components/sample', 'index.ts'),
      "export * from './sampleComponent';\nexport * from './sampleTypes';\n",
    );
  });
});

describe('ArtifactGenerator', () => {
  it('creates artifacts and index file using provided strategies', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const generator = new ArtifactGenerator({
      label: 'Test',
      color: chalk.white,
      resolveBasePath: (name) => `/tmp/${name}`,
      buildFiles: (name) => [
        { filename: `${name}.ts`, content: 'conteúdo', message: 'criando arquivo' },
      ],
      indexType: 'component',
      successMessage: (name) => `sucesso ${name}`,
    });

    await generator.generate('demo');

    expect(writeSpy).toHaveBeenCalledWith(
      path.join('/tmp/demo', 'demo.ts'),
      'conteúdo',
    );
    expect(writeSpy).toHaveBeenCalledWith(
      path.join('/tmp/demo', 'index.ts'),
      "export * from './demoComponent';\nexport * from './demoTypes';\n",
    );
    expect(logSpy).toHaveBeenCalledWith('sucesso demo');
  });

  it('skips index file when no indexType is provided', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

    const generator = new ArtifactGenerator({
      label: 'Test',
      color: chalk.white,
      resolveBasePath: () => '/tmp/demo',
      buildFiles: () => [],
      successMessage: () => 'ok',
    });

    await generator.generate('demo');

    const filenames = writeSpy.mock.calls.map(([filename]) => filename);
    expect(filenames.some((file) => file.endsWith('index.ts'))).toBe(false);
  });
});

describe('file builders', () => {
  it('buildComponentFiles returns expected structure', () => {
    const files = buildComponentFiles('sampleName');
    expect(files.map((file) => file.filename)).toEqual([
      'sampleNameComponent.tsx',
      'sampleNameStyles.ts',
      'sampleNameTypes.ts',
      'sampleNameFunctions.ts',
      'sampleNameComponent.test.tsx',
    ]);
    expect(files[0].content).toContain('export const SampleNameComponent');
  });

  it('buildScreenFiles returns expected structure', () => {
    const files = buildScreenFiles('flow');
    expect(files.map((file) => file.filename)).toEqual([
      'flowScreen.tsx',
      'flowStyles.ts',
      'flowTypes.ts',
      'flowFunctions.ts',
      'flowScreen.test.tsx',
    ]);
    expect(files[0].content).toContain('export const FlowScreen');
  });

  it('buildHookFiles returns expected structure', () => {
    const files = buildHookFiles('amazing');
    expect(files.map((file) => file.filename)).toEqual([
      'amazing.tsx',
      'amazingTypes.ts',
      'amazing.test.ts',
    ]);
    expect(files[0].content).toContain('export function useAmazing()');
  });

  it('buildNavigationFiles returns navigator template', () => {
    const files = buildNavigationFiles('journey');
    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('JourneyNavigation.tsx');
    expect(files[0].content).toContain("Stack.Screen name=\"Journey\"");
  });
});

describe('helpers', () => {
  it('capitalizeFirstLetter capitalizes correctly', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
    expect(capitalizeFirstLetter('')).toBe('');
    expect(capitalizeFirstLetter()).toBe('');
  });

  it('lowercaseFirstLetter lowercases correctly', () => {
    expect(lowercaseFirstLetter('Hello')).toBe('hello');
    expect(lowercaseFirstLetter('')).toBe('');
    expect(lowercaseFirstLetter()).toBe('');
  });
});

describe('handleCreationFlow', () => {
  it('delegates to the correct generator', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const generatorMock = {
      ...originalGenerators.component,
      generate: jest.fn().mockResolvedValue(),
    };
    GENERATORS.component = generatorMock;

    await handleCreationFlow('component', '  DemoName  ');

    expect(generatorMock.generate).toHaveBeenCalledWith('demoName');
    expect(logSpy).toHaveBeenCalledWith('› Voltando ao menu principal...');
  });

  it('throws for unsupported generator types', async () => {
    await expect(handleCreationFlow('unknown', 'name')).rejects.toThrow(
      'Tipo "unknown" não suportado.',
    );
  });
});

describe('showWelcome', () => {
  it('prints formatted welcome text and pauses', async () => {
    const clearSpy = jest.spyOn(console, 'clear').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await showWelcome();

    expect(clearSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('React Native Create Template CLI'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Selecione uma opção no menu'));
  });
});

describe('main', () => {
  it('executes creation flow when type and name arguments are provided', async () => {
    process.argv = ['node', 'script', 'component', 'NewItem'];
    const generateMock = jest.fn().mockResolvedValue();
    GENERATORS.component = {
      ...originalGenerators.component,
      generate: generateMock,
    };

    await main();

    expect(generateMock).toHaveBeenCalledWith('newItem');
  });

  it('prompts for name when only type is provided', async () => {
    process.argv = ['node', 'script', 'component'];
    const generateMock = jest.fn().mockResolvedValue();
    GENERATORS.component = {
      ...originalGenerators.component,
      generate: generateMock,
    };
    jest.spyOn(inquirer, 'prompt').mockResolvedValue({ name: 'FromPrompt' });

    await main();

    expect(generateMock).toHaveBeenCalledWith('fromPrompt');
  });

  it('runs interactive loop when no arguments are provided', async () => {
    process.argv = ['node', 'script'];
    const generateMock = jest.fn().mockResolvedValue();
    GENERATORS.component = {
      ...originalGenerators.component,
      generate: generateMock,
    };
    jest
      .spyOn(inquirer, 'prompt')
      .mockResolvedValueOnce({ type: 'component' })
      .mockResolvedValueOnce({ name: 'InteractiveItem' })
      .mockResolvedValueOnce({ type: 'exit' });
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await main();

    expect(generateMock).toHaveBeenCalledWith('interactiveItem');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Obrigado por usar o RN Create Template'));
  });

  it('handles user-initiated exit gracefully', async () => {
    process.argv = ['node', 'script'];
    const promptError = new Error('saindo');
    promptError.name = 'ExitPromptError';
    jest.spyOn(inquirer, 'prompt').mockImplementation(() => {
      throw promptError;
    });
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

    await main();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Programa interrompido pelo usuário'),
    );
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});
