import { NextRequest, NextResponse } from 'next/server';
import { WebhookConfigManager } from '@/lib/webhook/config';
import { WebhookSecurity } from '@/lib/webhook/security';
import { WebhookLogger } from '@/lib/webhook/logger';
import { IntelligentRevalidator } from '@/lib/webhook/revalidation';
import type { WebhookSecurityConfig } from '@/types/wordpress';

// Initialize webhook components (duplicated from revalidate route for isolation)
function initializeWebhookComponents() {
  const config: WebhookSecurityConfig = {
    secretToken: process.env.HEADLESS_SECRET || '',
    allowedIPs: process.env.WEBHOOK_ALLOWED_IPS?.split(',').map(ip => ip.trim()),
    rateLimitMaxRequests: parseInt(process.env.WEBHOOK_RATE_LIMIT_MAX || '30', 10),
    rateLimitWindowMs: parseInt(process.env.WEBHOOK_RATE_LIMIT_WINDOW || '60000', 10),
  };

  const security = new WebhookSecurity(config);
  const logger = new WebhookLogger({
    maxEntries: parseInt(process.env.WEBHOOK_LOG_MAX_ENTRIES || '2000', 10),
    logLevel: (process.env.WEBHOOK_LOG_LEVEL as any) || 'info',
    includePayload: process.env.WEBHOOK_LOG_INCLUDE_PAYLOAD !== 'false',
  });
  const revalidator = new IntelligentRevalidator();

  return { security, logger, revalidator };
}

// Admin endpoint for webhook management (protected by secret)
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Validate admin access
  const secretKey = request.headers.get('X-Headless-Secret-Key');
  if (!secretKey || secretKey !== process.env.HEADLESS_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const configManager = WebhookConfigManager.getInstance();

  try {
    switch (action) {
      case 'config':
        return NextResponse.json({
          config: configManager.getConfig(),
          summary: configManager.getConfigSummary(),
          validation: configManager.validateConfig(),
        });

      case 'stats':
        const { logger, security } = initializeWebhookComponents();
        const stats = logger.getStatistics();
        const securityStats = security.getStats();
        
        return NextResponse.json({
          webhook: {
            ...stats,
            ...securityStats,
          },
          config: configManager.getConfigSummary(),
        });

      case 'logs':
        const { logger: loggerInstance } = initializeWebhookComponents();
        const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '50', 10));
        const logs = loggerInstance.getRecentLogs(limit);
        
        return NextResponse.json({
          logs,
          total: logs.length,
        });

      case 'export':
        return NextResponse.json({
          config: configManager.exportConfig(),
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
        });

      default:
        return NextResponse.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          availableActions: ['config', 'stats', 'logs', 'export'],
        });
    }
  } catch (error) {
    console.error('Webhook admin endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Validate admin access
  const secretKey = request.headers.get('X-Headless-Secret-Key');
  if (!secretKey || secretKey !== process.env.HEADLESS_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const configManager = WebhookConfigManager.getInstance();

  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'update-config':
        if (!data) {
          return NextResponse.json({ error: 'Config data required' }, { status: 400 });
        }

        configManager.updateConfig(data);
        const validation = configManager.validateConfig();

        if (!validation.valid) {
          return NextResponse.json({ 
            error: 'Invalid configuration', 
            details: validation.errors 
          }, { status: 400 });
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Configuration updated successfully',
          config: configManager.getConfigSummary() 
        });

      case 'import-config':
        if (!data || !data.config) {
          return NextResponse.json({ error: 'Config string required' }, { status: 400 });
        }

        const importResult = configManager.importConfig(data.config);
        
        if (!importResult.success) {
          return NextResponse.json({ 
            error: 'Import failed', 
            details: importResult.error 
          }, { status: 400 });
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Configuration imported successfully',
          config: configManager.getConfigSummary() 
        });

      case 'clear-logs':
        const { logger } = initializeWebhookComponents();
        logger.clear();

        return NextResponse.json({ 
          success: true, 
          message: 'Logs cleared successfully' 
        });

      case 'test-webhook':
        // Trigger a test revalidation
        const testPayload = {
          action: 'admin_test',
          timestamp: Date.now(),
          testData: data || { message: 'Admin test webhook' },
        };

        // You could implement test webhook logic here
        return NextResponse.json({ 
          success: true, 
          message: 'Test webhook functionality not implemented yet',
          payload: testPayload 
        });

      default:
        return NextResponse.json({ 
          error: 'Unknown action',
          availableActions: ['update-config', 'import-config', 'clear-logs', 'test-webhook']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Webhook admin POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}