# feat2test

Convierte Features Gherkin en tests TypeScript deterministas y Step Adapters editables.

## Uso

Requiere Node.js 22.18+.

```bash
npm install -D feat2test vitest
npx feat2test generate features test/features --runner vitest
npx vitest run
```

La entrada puede ser un archivo `.feature`, `.feature.md` o una carpeta. Las carpetas se recorren
de forma recursiva y conservan su estructura en el destino.

```text
feat2test generate <feature> <output> --runner <vitest|node:test> [--check]
```

Opciones:

- `-r, --runner`: runner obligatorio.
- `--check`: valida sin escribir; falla si el test está desactualizado o falta el Step Adapter.
- `--debug`: incluye el stack trace.
- `--help`, `--version`: ayuda y versión.

Códigos de salida: `0` éxito, `1` error de Feature/generación/check, `2` uso o runner inválido.

## Runners

| Runner | Requisito | Import del adapter |
| --- | --- | --- |
| `vitest` | Vitest instalado en el proyecto | `*.steps.js` |
| `node:test` | Node.js, sin dependencia adicional | `*.steps.ts` |

feat2test genera tests; no ejecuta el runner.

```bash
npx feat2test generate features test/features --runner node:test
node --test test/features/example.feature.test.ts
```

## Salida

Para `features/payment.feature.md`:

```text
test/features/
├── payment.feature.test.ts    # generado; se actualiza
└── payment.feature.steps.ts   # tuyo; nunca se sobrescribe
```

El Step Adapter exporta `createSteps()`:

```ts
export function createSteps() {
  return {
    paymentIsReady(): void {
      // Implementación del proyecto
    },
  }
}
```

Cada step se convierte literalmente a `camelCase`. Los placeholders son parámetros `string`;
DataTable usa `string[][]` y DocString usa `string`. `Given`, `When` y `Then` agrupan métodos como
Context, Action y Outcome.

## CI

```json
{
  "scripts": {
    "features": "feat2test generate features test/features --runner vitest",
    "test": "npm run features && vitest run",
    "test:ci": "feat2test generate features test/features --runner vitest --check && vitest run"
  }
}
```

## Desarrollo

```bash
pnpm install
pnpm verify
```

Ejemplos completos: [`examples/calculator`](./examples/calculator) y
[`examples/order-confirmation`](./examples/order-confirmation).

Guía de Gherkin de negocio: [`.agents/skills/business-gherkin`](./.agents/skills/business-gherkin).

## Licencia

[MIT](./LICENSE)
