import path from 'node:path'
import { compileExample } from './compile-example.js'

async function main(): Promise<void> {
  const [inputPath, ...extra] = process.argv.slice(2)
  if (!inputPath || extra.length > 0) {
    throw new Error('Usage: yarn run:example <feature-or-directory>')
  }

  const compilation = await compileExample(inputPath)
  const { report } = compilation
  process.stdout.write(
    `✓ generated ${report.scenarioCount} tests from ${report.featureCount} ` +
      `feature${report.featureCount === 1 ? '' : 's'}\n`,
  )
  for (const artifactPath of compilation.artifactPaths) {
    process.stdout.write(`  ${path.relative(process.cwd(), artifactPath)}\n`)
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`✗ ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
