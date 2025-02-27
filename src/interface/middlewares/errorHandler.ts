import { Request, Response, NextFunction } from 'express';

/* eslint-disable @typescript-eslint/no-unused-vars */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction, // O Express precisa desta assinatura com 4 parâmetros
) => {
  console.error('Error not handled:', err);

  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'An unexpected error occurred. Please try again later.'
  });
}