module.exports = class StackFrame {
  toString() {
    if (this.name) {
      return `    at ${this.name} (${this.url}:${this.line}:${this.col})`
    } else {
      return `    at ${this.url}:${this.line}:${this.col}`
    }
  }
}
