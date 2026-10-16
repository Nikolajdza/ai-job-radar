export class AiProviderError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 502) {
    super(message);
    this.name = "AiProviderError";
    this.statusCode = statusCode;
  }
}

export class AiTimeoutError extends AiProviderError {
  constructor(message = "AI provider timed out") {
    super(message, 504);
    this.name = "AiTimeoutError";
  }
}

export class AiRateLimitError extends AiProviderError {
  constructor(message = "AI provider rate limit exceeded") {
    super(message, 429);
    this.name = "AiRateLimitError";
  }
}

export class AiValidationError extends AiProviderError {
  constructor(message = "AI provider returned invalid structured output") {
    super(message, 502);
    this.name = "AiValidationError";
  }
}
