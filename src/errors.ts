export class CodegenError extends Error {
  readonly code: string

  constructor(code: string, message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'CodegenError'
    this.code = code
  }
}

export function assertCodegen(
  condition: unknown,
  code: string,
  message: string,
): asserts condition {
  if (!condition) {
    throw new CodegenError(code, message)
  }
}
