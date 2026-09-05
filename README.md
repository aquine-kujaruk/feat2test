# feat2test

Traduce Gherkin a tests deterministas con una estrategia de runner configurable. Lee
`.feature` o `.feature.md` y genera dos archivos TypeScript: el Feature Test y un Step Adapter
que implementas tú. El adapter existente nunca se reescribe.

## Inicio rápido

Node.js **22.18+**. Sin instalación global:

```bash
npx feat2test init --strategy vitest
npm install -D vitest
npx feat2test generate
npx vitest run
```

`init` crea `feat2test.config.json`. Añade tus Features en `features/` antes de generar.
Para fijar la versión en el proyecto y en CI:

```bash
npm install -D feat2test vitest
npx feat2test --help
```

El binario npm se llama `feat2test`; también funciona con `npm exec -- feat2test`, `pnpm exec
feat2test` y `pnpm dlx feat2test`. [Referencia de npm exec](https://docs.npmjs.com/cli/npm-exec/).

## Configuración

```json
{
  "strategy": "vitest",
  "input": "features",
  "output": "test/features"
}
```

- `strategy` es obligatorio. Vitest se selecciona explícitamente; no hay runner implícito.
- `input` acepta un archivo o una carpeta. Las carpetas descubren `.feature` y `.feature.md`
  recursivamente, conservan las subcarpetas y detectan colisiones antes de generar.
- `output` indica la carpeta de destino. Puede coincidir con la entrada.
- `input` y `output` pueden omitirse del archivo si se pasan por CLI.

Busca el `feat2test.config.json` más cercano desde el directorio actual hacia sus padres. Usa
`--config <archivo>` para seleccionar otro; una configuración inválida nunca se ignora. Las rutas
configuradas son relativas al archivo; las rutas de CLI, al directorio actual. Las opciones de CLI
tienen prioridad. Las claves desconocidas y los valores inválidos producen error.

El paquete incluye `schema.json` para autocompletado. Tras instalarlo localmente, puedes añadir
`"$schema": "./node_modules/feat2test/schema.json"` a la configuración.

## Estrategias

| Estrategia | Runner | Import del adapter |
| --- | --- | --- |
| `vitest` | Vitest 3.2 / 4, instalado en tu proyecto | `*.steps.js` |
| `node:test` | Runner integrado de Node.js, sin dependencias adicionales | `*.steps.ts` |

feat2test no instala ni ejecuta el runner. La estrategia decide cómo emitir el test; el parser,
el plan de escenarios y el scaffold del adapter son independientes del runner.

```bash
npx feat2test init --strategy node:test
npx feat2test generate
node --test test/features/payment.feature.test.ts
```

Para `node:test`, implementa las aserciones con `node:assert/strict`. Node ejecuta el TypeScript
borrando tipos: usa sintaxis compatible y extensiones `.ts` en imports locales. Si verificas tipos
con `tsc --noEmit`, activa `allowImportingTsExtensions`.
[TypeScript en Node](https://nodejs.org/api/typescript.html).

Cambiar estrategia regenera los tests, pero no migra imports ni aserciones dentro de tus adapters.

## CLI

```bash
feat2test init [--strategy <nombre>]
feat2test generate [entrada] [salida] [opciones]
feat2test check [entrada] [salida] [opciones]
feat2test <entrada> <salida> [opciones]
feat2test strategies
```

| Opción | Uso |
| --- | --- |
| `-c, --config <archivo>` | Configuración JSON explícita |
| `-i, --input <ruta>` | Archivo o carpeta de Features |
| `-o, --output <carpeta>` | Carpeta de destino |
| `-s, --strategy <nombre>` | Sobrescribir la estrategia configurada |
| `--check` | Equivalente a `check`, sin escribir |
| `--json` | Un objeto JSON en stdout, tanto en éxito como en error |
| `-q, --quiet` | Ocultar el resumen; conservar avisos y errores |
| `--debug` | Incluir stack trace en stderr |
| `-h, --help` | Ayuda con ejemplos |
| `-v, --version` | Versión del paquete |

Sin argumentos, genera usando la configuración disponible; si no existe, muestra ayuda.
`init` no es interactivo y nunca sobrescribe una configuración existente.

```bash
npx feat2test features/payments.feature.md test/payments --strategy vitest
npx feat2test generate --config config/tests.json
npx feat2test check --json
```

Códigos de salida: **0** éxito; **1** error de generación, conflicto o tests desactualizados;
**2** argumentos, configuración o estrategia inválidos. `--json` incluye `ok`, conteos y `reports`
con rutas y avisos, o `error: { code, message }`. No se combina con `--quiet`.
La generación de carpetas se detiene en el primer error; los archivos anteriores pueden haberse
generado. `check` nunca escribe.

Para `features/transfers.feature.md` genera:

```text
test/features/
├── transfers.feature.test.ts    ← del generador, se reescribe siempre
└── transfers.feature.steps.ts   ← tuyo, se crea una vez y no se toca más
```

El prefijo sale del archivo de entrada: se quita su última extensión y se añade `.feature` si el
resto no termina así.

| Entrada | Prefijo |
| --- | --- |
| `customer.feature` | `customer.feature` |
| `customer.feature.md` | `customer.feature` |
| `customer.spec.md` | `customer.spec.feature` |

## Flujo

1. Escribe la Feature.
2. Genera. El Step Adapter nace con métodos que lanzan `PENDING:` y el test falla: es el RED
   inicial.
3. Implementa esos métodos contra el código real hasta llegar a GREEN.
4. Cambia la Feature y vuelve a generar. El test se reescribe; tu adapter no.

```json
{
  "scripts": {
    "features": "feat2test generate",
    "test": "npm run features && vitest run",
    "test:ci": "feat2test check && vitest run"
  }
}
```

`--check` no escribe nada. Falla si el Feature Test está desactualizado o si falta el Step Adapter.

## Formato de entrada

La extensión elige el parser: `.md` usa Markdown Gherkin, cualquier otra usa Gherkin clásico.
Gherkin clásico respeta un encabezado `# language:`; Markdown Gherkin se lee en inglés.

En Markdown Gherkin cada fila de tabla necesita al menos dos espacios iniciales, y ninguna tabla
Gherkin lleva fila separadora (`| --- |`): Cucumber la trata como datos. El generador no las toca,
pero avisa de ambas con su línea.

Si el contenido no produce una Feature con nombre y al menos un escenario ejecutable, falla con
`INVALID_GHERKIN` antes de escribir nada.

## Archivos generados

### Feature Test: `*.feature.test.ts`

Del generador. Se reescribe en cada ejecución y nunca debe editarse a mano. Un `Rule` se convierte
en un `describe` anidado, cada escenario en un `test`, y cada fila de `Examples` en un test
independiente. Los steps de `Background` se insertan en línea en cada escenario. Cada test crea su
propio `createSteps()`, así que no comparten estado.

```ts
describe('Feature: Calculator display', () => {
  describe('Rule: Spanish number presentation', () => {
    // Line 34
    test('Show 1234.56 with Spanish separators', async () => {
      const steps = createSteps()

      // Given a calculator with an empty display
      await steps.aCalculatorWithAnEmptyDisplay()
      // When the current value is `1234.56`
      await steps.theCurrentValueIs('1234.56')
      // Then the display shows `1.234,56`
      await steps.theDisplayShows('1.234,56')
    })
  })
})
```

Si el archivo existe y no lo escribió el generador, falla con `OUTPUT_CONFLICT` en vez de
sobrescribirlo.

### Step Adapter: `*.feature.steps.ts`

Tuyo. Se crea solo si no existe y **nunca se reescribe**. Puede tener imports, estado, helpers y lo
que haga falta; solo necesita exportar `createSteps()`.

```ts
export function createSteps() {
  let calculator: Calculator

  return {
    // Context
    aCalculatorWithAnEmptyDisplay(): void {
      calculator = createCalculator()
    },

    // Action
    theCurrentValueIs(value: string): void {
      calculator.enter(Number(value))
    },

    // Outcome
    theDisplayShows(display: string): void {
      expect(calculator.display).toBe(display)
    },
  }
}
```

Cuando la Feature cambia, TypeScript y el test fallando reportan la diferencia: un método nuevo no
existe, uno renombrado deja huérfano al anterior. El generador no arregla eso por ti, y esa es la
decisión de diseño.

## Del step al método

El nombre del método son las palabras literales del step, sin sus placeholders, en camelCase. No hay
reescritura lingüística.

```text
When value <value> is formatted for language <language>
  → valueIsFormattedForLanguage(value: string, language: string)
```

Los parámetros salen **solo** de placeholders `<...>`, en orden de aparición. Un literal entre
comillas es texto del step, no una entrada. Un DataTable añade `table: string[][]`; un DocString
añade `text: string`. Todo llega como `string`: la conversión al dominio es del adapter.

Los métodos se agrupan por su función en el escenario: Context (`Given`), Action (`When`), Outcome
(`Then`). `And` y `But` heredan la del step anterior.

| Error | Causa |
| --- | --- |
| `UNKNOWN_PLACEHOLDER` | Un `<placeholder>` sin columna en `Examples`. |
| `CONFLICTING_STEP_ROLE` | Las mismas palabras usadas como `Given` y como `Then`. |
| `CONFLICTING_STEP_INPUTS` | Las mismas palabras con placeholders distintos. |

## Alcance y diseño

Genera y mantiene el arnés de tests. No ejecuta el runner, no implementa comportamiento, no reconcilia
tu código y no decide cómo organizar dependencias.

Traduce; no infiere. Todo lo que no hace —inferir tipos, construir objetos anidados desde rutas con
punto, quitar backticks de los valores, acortar nombres de método, reconciliar el adapter, dialectos
en Markdown Gherkin— es una omisión deliberada, no un bug. Antes de escribir código para reconciliar
un desajuste, comprueba si TypeScript o el test fallando ya lo reportan.

La guía para escribir buenas especificaciones está en
[`.agents/skills/business-gherkin`](./.agents/skills/business-gherkin). Es independiente de esta
herramienta; el contrato de entrada del generador vive aparte, en
[`references/feat2test.md`](./.agents/skills/business-gherkin/references/feat2test.md).

Dos ejemplos completos y en verde: [`examples/calculator`](./examples/calculator) para el flujo
básico, y [`examples/order-confirmation`](./examples/order-confirmation) para una colección anidada
—`Order` → `lines[]` → `product`— reconstruida desde un DataTable dentro del adapter.

## Desarrollo

```bash
pnpm install
pnpm example
pnpm verify
```

Para probar otro archivo dentro del repositorio:

```bash
pnpm codegen <input-file> <output-directory> --strategy vitest
```

## Migración desde el nombre anterior

Instala `feat2test`, cambia el comando de tus scripts y ejecuta `feat2test init --strategy vitest`.
La cabecera de los tests del generador anterior se reconoce para poder regenerarlos. Los adapters
existentes conservan íntegramente su código. `check` falla hasta actualizar los tests.

## Publicación en npm

```bash
pnpm verify
npm pack
```

`verify` comprueba formato, tipos, tests, cobertura, build, metadatos y el tarball real: lo instala
en un proyecto temporal sin dependencias de desarrollo, invoca `npx feat2test`, genera, comprueba y
ejecuta un test con `node:test`. Necesita acceso al registro npm para esa instalación aislada.
`prepack` construye `dist` también al ejecutar `npm pack` o `npm publish` directamente.

La distribución incluye únicamente `dist`, el schema, README, licencia, changelog y metadatos.
Vitest y TypeScript son herramientas de desarrollo de este repositorio, no dependencias del CLI.

El workflow `Release` usa semantic-release en `main` para asignar versión y publicar. Antes de
activarlo, el repositorio GitHub debe llamarse `feat2test` y el paquete npm debe tener configurado
el Trusted Publisher de ese repositorio y del workflow `release.yml`, con publicación directa
habilitada. Configuración: [Trusted publishing en npm](https://docs.npmjs.com/trusted-publishers/).
Si el paquete aún no existe, realiza primero la publicación inicial autenticada para poder
configurar sus permisos. La versión
`0.0.0-development` es de desarrollo; semantic-release la sustituye al publicar una release.
El cambio local de nombre no renombra por sí solo el repositorio remoto ni publica en npm.

## Licencia

[MIT](./LICENSE)
