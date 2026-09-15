import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  code?: string;
  status?: number;
  retryAfter?: number;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Do not log tokens or sensitive data
  console.error(`[Error] ${err.message} (code: ${err.code ?? 'UNKNOWN'})`);

  if (err.code === 'RATE_LIMITED') {
    res.status(429).json({
      error: 'Rate limited',
      message: 'Spotify is rate limiting requests. Please try again shortly.',
      retryAfter: err.retryAfter,
    });
    return;
  }

  if (err.code === 'UNAUTHORIZED') {
    res.status(401).json({
      error: 'Spotify session expired',
      message: 'Your Spotify connection has expired. Please reconnect.',
    });
    return;
  }

  if (err.code === 'FORBIDDEN') {
    res.status(403).json({
      error: 'Feature unavailable',
      message:
        'This Spotify feature may require a Premium account or additional permissions.',
    });
    return;
  }

  const status = err.status ?? 500;
  res.status(status).json({
    error: 'Something went wrong',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred. Please try again.',
  });
}
