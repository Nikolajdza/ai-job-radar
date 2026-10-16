export class UnauthorizedError extends Error {
  readonly statusCode = 401;

  constructor(message = "Sign in to continue") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  readonly statusCode = 403;

  constructor(message = "You do not have access to this resource") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class ProfileIncompleteError extends Error {
  readonly statusCode = 422;

  constructor(
    message = "Add skills or upload your CV on your profile first so the AI has something to work with.",
  ) {
    super(message);
    this.name = "ProfileIncompleteError";
  }
}
