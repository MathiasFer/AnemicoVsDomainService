export class DomainException extends Error {
  constructor(
    message: string,
    public readonly source: string,          // e.g., 'Usuario', 'Producto', 'ValidadorFraudeService'
    public readonly method: string,          // e.g., 'retirarSaldo', 'descontarStock'
    public readonly type: 'ENTITY' | 'DOMAIN_SERVICE' | 'VALUE_OBJECT',
    public readonly explanation: string,     // Explicación didáctica sobre el concepto de negocio
    public readonly codeSnippet: string      // Fragmento de código responsable de la regla
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // Restaurar cadena de prototipos
  }
}
