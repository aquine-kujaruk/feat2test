# gherkin-vitest-codegen

Generador determinista de **Feature Tests** para Vitest a partir de Gherkin. Convierte una
especificación ejecutable en dos archivos TypeScript explícitos: el test que reproduce sus Pickles y
un Step Adapter donde se implementa el comportamiento. La primera generación queda en RED; las
regeneraciones conservan el código del desarrollador.

## Propósito

La herramienta aporta un punto de partida mecánico para TDD:

```text
Gherkin válido
    -> Feature + escenarios + Pickles de Cucumber
    -> Feature Test de Vitest
    -> Step Adapter pendiente
    -> implementación del comportamiento
    -> GREEN
```

No interpreta la arquitectura de la aplicación ni genera código de producción. El Step Adapter es
el límite explícito entre el lenguaje de la Feature y el sistema probado: allí se crean dependencias,
se convierten strings y se expresan aserciones.

## Requisitos e instalación

- Node.js 22.18 o superior.
- Vitest 3.2 o 4.

```bash
pnpm add -D gherkin-vitest-codegen vitest
# npm install --save-dev gherkin-vitest-codegen vitest
# yarn add --dev gherkin-vitest-codegen vitest
```

## Uso

El CLI recibe exactamente un archivo de entrada y un directorio de salida:

```bash
gherkin-vitest-codegen <input-file> <output-directory>
gherkin-vitest-codegen <input-file> <output-directory> --check
```

Ejemplo:

```bash
pnpm exec gherkin-vitest-codegen features/transfers.feature test/features
pnpm exec vitest run
```

Para `features/transfers.feature` genera:

```text
test/features/
├── transfers.feature.test.ts
└── transfers.feature.steps.ts
```

El nombre parte del archivo de entrada. Se elimina solo su última extensión y se añade `.feature` si
el stem aún no termina así:

| Entrada | Prefijo de salida |
| --- | --- |
| `customer.feature` | `customer.feature` |
| `customer.feature.md` | `customer.feature` |
| `customer.txt` | `customer.feature` |
| `customer.spec.txt` | `customer.spec.feature` |

Los caracteres `#`, `?`, `%` y cualquier `\` literal en la ruta de salida o el nombre base se
rechazan con `INVALID_PATH`: Vitest no puede descubrir de forma fiable los módulos resultantes.

## Flujo recomendado

1. Escribir una Feature con ejemplos observables.
2. Ejecutar el generador. Los métodos nuevos del Step Adapter quedan pendientes y el Feature Test
   falla deliberadamente.
3. Implementar esos métodos usando el código real y ejecutar Vitest hasta llegar a GREEN.
4. Tras cambiar la Feature, volver a generar. El reconciliador conserva los cuerpos existentes y
   señala el trabajo que la modificación exige.
5. En CI, ejecutar primero `--check` y después Vitest.

```json
{
  "scripts": {
    "features:generate": "gherkin-vitest-codegen features/transfers.feature test/features",
    "features:check": "gherkin-vitest-codegen features/transfers.feature test/features --check",
    "test": "pnpm features:generate && vitest run",
    "test:ci": "pnpm features:check && vitest run"
  }
}
```

`--check` no escribe. Termina con error si los archivos generados no corresponden a la Feature, hay
Steps pendientes u obsoletos, o existen salidas huérfanas.

## Contrato de entrada

El nombre y la extensión no determinan el formato. El contenido puede usar Gherkin plano o su
presentación Markdown siempre que Cucumber produzca:

- una Feature con nombre;
- escenarios ejecutables;
- Pickles válidos con Steps.

El dialecto por defecto es inglés. Otro dialecto debe declararse con el encabezado estándar, por
ejemplo `# language: es`. `Background`, `Rule`, `Scenario Outline`, `Examples`, DocStrings y
DataTables se conservan al compilar. Los tags heredados quedan como metadatos legibles; no activan
por sí mismos `skip`, `only` u otro comportamiento de Vitest.

Si el contenido no satisface el contrato, el CLI informa `INVALID_GHERKIN`. La validación y la
generación completa ocurren antes de tocar el directorio de salida.

## Archivos generados

### Feature Test: `*.feature.test.ts`

Es propiedad del generador y se reemplaza en cada generación. Importa `createSteps()`, crea una
instancia nueva por escenario y traduce los Pickles a tests Vitest legibles. Debe poder revisarse,
depurarse y versionarse como cualquier test TypeScript.

### Step Adapter: `*.feature.steps.ts`

Su estructura se reconcilia automáticamente; sus cuerpos pertenecen al desarrollador. Cada Feature
tiene un adapter independiente. El punto de entrada fijo es:

```ts
export function createSteps() {
  let applicationState = createApplicationState()

  return {
    anAccountWithBalance(balance: string): void {
      applicationState = accountWithBalance(Number(balance))
    },

    async theyTransfer(amount: string): Promise<void> {
      await applicationState.transfer(Number(amount))
    },
  }
}
```

Puede contener imports, helpers, estado y preparación arbitrarios. El objeto retornado debe usar
métodos abreviados y cada método declarar explícitamente `void` o `Promise<void>`. Las propiedades
arrow y otros retornos se rechazan como formas no soportadas antes de escribir archivos.

Los valores provenientes de Gherkin llegan como `string`; la conversión al dominio pertenece al
adapter. La forma de argumentos es estable:

| Entradas del Step | Método generado |
| --- | --- |
| Ninguna | `theAccountExists(): void` |
| Una | `theyTransfer(amount: string): void` |
| Dos o más | `theyTransfer(theyTransferType: TheyTransferType): void` |

Para varias entradas se genera un objeto cuyo type sigue `<PascalStepName>Type` y cuyo parámetro
sigue `<camelStepName>Type`. Variantes compatibles de un mismo Step producen una unión, por ejemplo:

```ts
type TheyTransferType =
  | { amount: string }
  | { amount: string; currency: string }
```

La tabla describe Steps sin variantes. Si un mismo Step Name combina una variante sin entradas con
otra que sí las tiene, todas usan el objeto unión: la variante vacía recibe `{}` y se representa
como `Record<string, never>`.

DocStrings y DataTables se mantienen como entradas estructuradas y se incluyen en el objeto cuando
conviven con otras entradas.

## Identidad y reconciliación de Steps

La identidad estable es el **Step Name**: las palabras literales normalizadas, sin sus valores
dinámicos. No es la firma TypeScript completa.

| Cambio en la Feature | Resultado al regenerar |
| --- | --- |
| Mismo Step Name y mismas entradas | Conserva método y cuerpo. |
| Mismo Step Name, entradas distintas | Actualiza parámetros, conserva cuerpo e inserta un guard pendiente al inicio. |
| Step Name nuevo | Añade un método pendiente. |
| Step Name desaparecido | Conserva el método como obsoleto y emite warning. |
| Step renombrado | Añade el nuevo como pendiente y conserva el anterior como obsoleto. |

Un Step pendiente lanza un error intencional: una Feature modificada debe volver a RED hasta adaptar
su implementación. Un Step obsoleto no se elimina automáticamente porque su cuerpo puede contener
código útil; un humano o agente debe revisarlo y borrarlo expresamente.

El reconciliador usa el AST de TypeScript para localizar `createSteps()` y aplica cambios
posicionales. No reimprime ni reformatea cuerpos existentes. Los métodos se ordenan por su función en
el escenario:

1. Context (`Given`, y sus `And`/`But`).
2. Action (`When`, y sus `And`/`But`).
3. Outcome (`Then`, y sus `And`/`But`).
4. Obsolete.

Dentro de cada grupo se respeta la primera aparición en la Feature. Un mismo Step Name con funciones
semánticas incompatibles produce `CONFLICTING_STEP_ROLE`.

Los literales dinámicos sin placeholder semántico siguen siendo válidos. Reciben nombres genéricos
como `value` y `value2`, junto al warning educativo `ANONYMOUS_STEP_INPUT`. Para contratos más claros,
conviene usar placeholders con nombre en `Scenario Outline`.

## Seguridad de generación

Ambos archivos incluyen metadatos de esquema y origen. Se usan para aplicar estas garantías:

- El par se calcula por completo y se prepara en archivos temporales antes de publicar.
- Un error ordinario durante el reemplazo activa rollback de ambos archivos. Un corte abrupto del
  proceso o del sistema no puede ofrecer atomicidad multiarchivo portable.
- Un destino perteneciente a otro origen falla con `OUTPUT_OWNERSHIP_CONFLICT`; nunca se sobrescribe.
- Una salida cuyo origen ya no existe se marca como `ORPHANED_FEATURE_OUTPUT`; nunca se borra sola.
- Un archivo con forma TypeScript no soportada hace fallar toda la operación sin cambios parciales.
- El modo normal muestra warnings de entradas anónimas, Steps obsoletos y salidas huérfanas.
- `--check` convierte drift, Pending Steps, Obsolete Steps y salidas huérfanas en error.

## Alcance

La herramienta genera y mantiene el arnés de Feature Tests. No ejecuta Vitest, no implementa el
comportamiento y no decide cómo organizar dependencias. La reutilización entre adapters se expresa
con imports y helpers TypeScript normales.

El ejemplo completo está en [`examples/calculator`](./examples/calculator).

## Desarrollo

```bash
pnpm install
pnpm codegen examples/add-to-cart/add-to-cart.feature examples/add-to-cart
pnpm test:feature examples/add-to-cart/add-to-cart.feature.test.ts
pnpm verify
```

Dentro de este repositorio se usa `pnpm codegen ...`: construye el binario local y le reenvía los
argumentos. `pnpm test:feature <archivo>` ejecuta el Feature Test concreto; tras generarlo fallará
por sus Steps pendientes, que es el RED inicial esperado. `pnpm exec gherkin-vitest-codegen` solo
funciona cuando el paquete está instalado y su binario existe en `node_modules/.bin`.

El repositorio aplica TypeScript estricto, Biome, cobertura Vitest, `publint` y Are The Types Wrong.
Las releases usan Conventional Commits y semantic-release.

## Licencia

[MIT](./LICENSE)
