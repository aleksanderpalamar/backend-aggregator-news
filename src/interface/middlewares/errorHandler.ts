import { Request, Response } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
) => {
  console.error('Error not handled:', err);

  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'An unexpected error occurred. Please try again later.'
  });
}