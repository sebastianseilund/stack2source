module.exports = class StackFrame {
  get name() {
    return this.sourceName || this.targetName
  }

  get url() {
    return this.sourceUrl || this.targetUrl
  }

  get line() {
    return this.sourceLine || this.targetLine
  }

  get col() {
    return this.sourceCol || this.targetCol
  }

  toString() {
    if (this.name) {
      return `    at ${this.name} (${this.url}:${this.line}:${this.col})`
    } else {
      return `    at ${this.url}:${this.line}:${this.col}`
    }
  }
}
