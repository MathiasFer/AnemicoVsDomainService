export class DomainException extends Error {
  constructor(
    message: string,
    public readonly source: string,
    public readonly method: string,
    public readonly type: 'ENTITY' | 'DOMAIN_SERVICE' | 'VALUE_OBJECT',
    public readonly explanation: string,
    public readonly codeSnippet: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
