const formatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 10,
  useGrouping: 'always',
})

export class Calculator {
  #expression = ''
  #result: string | undefined

  press(character: string): void {
    if (this.#result !== undefined) {
      this.#expression = ''
      this.#result = undefined
    }
    this.#expression += character
  }

  setValue(value: number): void {
    this.#expression = formatter.format(value)
    this.#result = undefined
  }

  equals(): void {
    const normalized = this.#expression.replaceAll('.', '').replace(',', '.')
    if (!/^[\d+\-*/.() ]+$/.test(normalized)) {
      this.#result = 'Error'
      return
    }
    try {
      const value = evaluate(normalized)
      this.#result = Number.isFinite(value) ? formatter.format(value) : 'Error'
    } catch {
      this.#result = 'Error'
    }
  }

  get display(): string {
    return this.#result ?? this.#expression
  }
}

function evaluate(expression: string): number {
  const numbers = expression.split(/([+*/-])/).map((token) => token.trim())
  if (numbers.length !== 3) throw new Error('Example evaluator accepts one operation.')
  const left = Number(numbers[0])
  const right = Number(numbers[2])
  switch (numbers[1]) {
    case '+':
      return left + right
    case '-':
      return left - right
    case '*':
      return left * right
    case '/':
      return left / right
    default:
      throw new Error('Unknown operation.')
  }
}
