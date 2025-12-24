export class ApiError extends Error {
  public status: number;
  public code: string;
  public meta?: Record<string, string | number>;

  constructor(
    code: string,
    status = 400,
    meta?: Record<string, string | number>,
    message?: string,
  ) {
    super(message || code);
    this.code = code;
    this.status = status;
    this.meta = meta;
  }
}
