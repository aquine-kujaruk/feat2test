export class CodegenError extends Error {
  readonly code: string

  constructor(code: string, message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'CodegenError'
    this.code = code
  }
}
