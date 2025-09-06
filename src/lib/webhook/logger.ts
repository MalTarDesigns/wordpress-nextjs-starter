import type { WebhookLogEntry, RevalidationRequest } from '@/types/wordpress';

export interface LoggerConfig {
  maxEntries?: number;
  persistToDisk?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  includePayload?: boolean;
  sensitiveFields?: string[];
}

export class WebhookLogger {
  private logs: WebhookLogEntry[] = [];
  private config: Required<LoggerConfig>;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      maxEntries: 1000,
      persistToDisk: false,
      logLevel: 'info',
      includePayload: true,
      sensitiveFields: ['password', 'token', 'secret', 'key'],
      ...config,
    };
  }

  async logRequest(
    requestId: string,
    request: {
      ip: string;
      method: string;
      path: string;
      userAgent?: string;
    },
    response: {
      statusCode: number;
      processingTimeMs: number;
    },
    details: {
      contentType?: string;
      action?: string;
      pathsRevalidated?: number;
      tagsRevalidated?: number;
      errors?: string[];
      payload?: Partial<RevalidationRequest>;
    } = {}
  ): Promise<void> {
    const entry: WebhookLogEntry = {
      timestamp: Date.now(),
      requestId,
      ip: request.ip,
      method: request.method,
      path: request.path,
      statusCode: response.statusCode,
      processingTimeMs: response.processingTimeMs,
      contentType: details.contentType,
      action: details.action,
      pathsRevalidated: details.pathsRevalidated || 0,
      tagsRevalidated: details.tagsRevalidated || 0,
      errors: details.errors || [],
      userAgent: request.userAgent,
      payload: this.config.includePayload ? this.sanitizePayload(details.payload) : undefined,
    };

    // Add to in-memory logs
    this.logs.push(entry);
    
    // Trim logs if exceeding max entries
    if (this.logs.length > this.config.maxEntries) {
      this.logs.shift();
    }

    // Console logging based on level and status
    this.consoleLog(entry);

    // Persist to disk if configured (in production, use a proper logging service)
    if (this.config.persistToDisk) {
      await this.persistLog(entry);
    }
  }

  private consoleLog(entry: WebhookLogEntry): void {
    const logLevel = this.determineLogLevel(entry.statusCode, entry.errors.length > 0);
    
    if (this.shouldLog(logLevel)) {
      const message = this.formatLogMessage(entry);
      
      switch (logLevel) {
        case 'error':
          console.error(message);
          break;
        case 'warn':
          console.warn(message);
          break;
        case 'debug':
          console.debug(message);
          break;
        default:
          console.log(message);
      }
    }
  }

  private determineLogLevel(statusCode: number, hasErrors: boolean): 'debug' | 'info' | 'warn' | 'error' {
    if (statusCode >= 500 || hasErrors) return 'error';
    if (statusCode >= 400) return 'warn';
    if (statusCode >= 200) return 'info';
    return 'debug';
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= configLevelIndex;
  }

  private formatLogMessage(entry: WebhookLogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const status = entry.statusCode;
    const time = entry.processingTimeMs;
    const method = entry.method;
    const path = entry.path;
    const ip = entry.ip;
    
    let message = `[${timestamp}] ${method} ${path} - ${status} (${time}ms) - IP: ${ip}`;
    
    if (entry.contentType) {
      message += ` - Content: ${entry.contentType}`;
    }
    
    if (entry.action) {
      message += ` - Action: ${entry.action}`;
    }
    
    if (entry.pathsRevalidated > 0 || entry.tagsRevalidated > 0) {
      message += ` - Revalidated: ${entry.pathsRevalidated} paths, ${entry.tagsRevalidated} tags`;
    }
    
    if (entry.errors.length > 0) {
      message += ` - Errors: [${entry.errors.join(', ')}]`;
    }
    
    return message;
  }

  private sanitizePayload(payload?: Partial<RevalidationRequest>): Partial<RevalidationRequest> | undefined {
    if (!payload) return undefined;
    
    const sanitized = { ...payload };
    
    // Remove or mask sensitive fields
    if (sanitized.metadata) {
      const cleanMetadata = { ...sanitized.metadata };
      
      for (const sensitiveField of this.config.sensitiveFields) {
        if (cleanMetadata[sensitiveField]) {
          cleanMetadata[sensitiveField] = '[REDACTED]';
        }
      }
      
      sanitized.metadata = cleanMetadata;
    }
    
    return sanitized;
  }

  private async persistLog(entry: WebhookLogEntry): Promise<void> {
    try {
      // In production, this should write to a file or database
      // For now, we'll just format it as structured JSON
      const logLine = JSON.stringify({
        ...entry,
        timestamp: new Date(entry.timestamp).toISOString(),
      });
      
      // Could write to file system here
      // await fs.appendFile('webhook-logs.jsonl', logLine + '\n');
    } catch (error) {
      console.error('Failed to persist webhook log:', error);
    }
  }

  // Query methods for log analysis
  getRecentLogs(limit: number = 50): WebhookLogEntry[] {
    return this.logs
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  getLogsByDateRange(startTime: number, endTime: number): WebhookLogEntry[] {
    return this.logs.filter(
      log => log.timestamp >= startTime && log.timestamp <= endTime
    );
  }

  getLogsByStatus(statusCode: number): WebhookLogEntry[] {
    return this.logs.filter(log => log.statusCode === statusCode);
  }

  getErrorLogs(): WebhookLogEntry[] {
    return this.logs.filter(log => log.statusCode >= 400 || log.errors.length > 0);
  }

  getStatistics(timeWindowMs: number = 3600000): {
    totalRequests: number;
    successfulRequests: number;
    errorRequests: number;
    averageProcessingTime: number;
    topIPs: Array<{ ip: string; count: number }>;
    topContentTypes: Array<{ contentType: string; count: number }>;
    revalidationStats: {
      totalPaths: number;
      totalTags: number;
    };
  } {
    const cutoffTime = Date.now() - timeWindowMs;
    const relevantLogs = this.logs.filter(log => log.timestamp >= cutoffTime);
    
    const totalRequests = relevantLogs.length;
    const successfulRequests = relevantLogs.filter(log => log.statusCode >= 200 && log.statusCode < 400).length;
    const errorRequests = totalRequests - successfulRequests;
    
    const averageProcessingTime = relevantLogs.length > 0
      ? relevantLogs.reduce((sum, log) => sum + log.processingTimeMs, 0) / relevantLogs.length
      : 0;
    
    // Top IPs
    const ipCounts = relevantLogs.reduce((acc, log) => {
      acc[log.ip] = (acc[log.ip] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topIPs = Object.entries(ipCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));
    
    // Top content types
    const contentTypeCounts = relevantLogs
      .filter(log => log.contentType)
      .reduce((acc, log) => {
        const contentType = log.contentType!;
        acc[contentType] = (acc[contentType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const topContentTypes = Object.entries(contentTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([contentType, count]) => ({ contentType, count }));
    
    // Revalidation stats
    const revalidationStats = relevantLogs.reduce(
      (acc, log) => {
        acc.totalPaths += log.pathsRevalidated;
        acc.totalTags += log.tagsRevalidated;
        return acc;
      },
      { totalPaths: 0, totalTags: 0 }
    );
    
    return {
      totalRequests,
      successfulRequests,
      errorRequests,
      averageProcessingTime: Math.round(averageProcessingTime * 100) / 100,
      topIPs,
      topContentTypes,
      revalidationStats,
    };
  }

  clear(): void {
    this.logs = [];
  }

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = [
        'timestamp', 'requestId', 'ip', 'method', 'path', 'statusCode',
        'processingTimeMs', 'contentType', 'action', 'pathsRevalidated',
        'tagsRevalidated', 'errors', 'userAgent'
      ];
      
      const csvLines = [
        headers.join(','),
        ...this.logs.map(log => [
          new Date(log.timestamp).toISOString(),
          log.requestId,
          log.ip,
          log.method,
          log.path,
          log.statusCode,
          log.processingTimeMs,
          log.contentType || '',
          log.action || '',
          log.pathsRevalidated,
          log.tagsRevalidated,
          `"${log.errors.join('; ')}"`,
          `"${log.userAgent || ''}"`
        ].join(','))
      ];
      
      return csvLines.join('\n');
    }
    
    return JSON.stringify(this.logs, null, 2);
  }
}