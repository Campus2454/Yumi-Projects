import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface UserRequestInfo {
  count: number;
  queue: Function[];
}

@Injectable()
export class LimitMiddleware implements NestMiddleware {
  private maxRequestsPerSecond = 1;
  private requestInterval = 2000; // 2 วินาที
  private usersMap = new Map<string, UserRequestInfo>();

  use(req: Request, res: Response, next: NextFunction) {
    return next();
    const userId = req.ip || 'unknown'; // จะใช้ header หรือ user id ก็ได้ถ้ามี auth
    const userInfo = this.usersMap.get(userId) || { count: 0, queue: [] };

    if (userInfo.count >= this.maxRequestsPerSecond) {
      userInfo.queue.push(() => this.processRequest(userId, req, res, next));
      this.usersMap.set(userId, userInfo);
      return;
    }

    this.processRequest(userId, req, res, next);
  }

  private processRequest(userId: string, req: Request, res: Response, next: NextFunction) {
    const userInfo = this.usersMap.get(userId) || { count: 0, queue: [] };
    userInfo.count++;
    this.usersMap.set(userId, userInfo);

    next();

    setTimeout(() => {
      const updatedInfo = this.usersMap.get(userId);
      if (!updatedInfo) return;

      updatedInfo.count = Math.max(0, updatedInfo.count - 1);
      if (updatedInfo.queue.length > 0) {
        const nextRequest = updatedInfo.queue.shift();
        if (nextRequest) nextRequest();
      }

      this.usersMap.set(userId, updatedInfo);
    }, this.requestInterval);
  }
}
