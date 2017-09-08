module.exports = class Stack {
  toString() {
    return (
      (this.message || '(no message)') +
      '\n' +
      this.frames.map(frame => frame.toString()).join('\n')
    )
  }
}
