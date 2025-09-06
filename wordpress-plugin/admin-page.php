<?php
/**
 * Admin page template for Next.js Revalidation Webhook plugin
 * 
 * @package NextJSRevalidationWebhook
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1><?php _e('Next.js Revalidation Webhook Settings', 'nextjs-revalidation-webhook'); ?></h1>
    
    <div id="nextjs-webhook-tabs">
        <h2 class="nav-tab-wrapper">
            <a href="#tab-general" class="nav-tab nav-tab-active"><?php _e('General Settings', 'nextjs-revalidation-webhook'); ?></a>
            <a href="#tab-triggers" class="nav-tab"><?php _e('Triggers', 'nextjs-revalidation-webhook'); ?></a>
            <a href="#tab-advanced" class="nav-tab"><?php _e('Advanced', 'nextjs-revalidation-webhook'); ?></a>
            <a href="#tab-logs" class="nav-tab"><?php _e('Logs', 'nextjs-revalidation-webhook'); ?></a>
            <a href="#tab-help" class="nav-tab"><?php _e('Help', 'nextjs-revalidation-webhook'); ?></a>
        </h2>

        <form method="post" action="">
            <?php wp_nonce_field('nextjs_revalidation_webhook_settings'); ?>
            
            <!-- General Settings Tab -->
            <div id="tab-general" class="tab-content">
                <h3><?php _e('Connection Settings', 'nextjs-revalidation-webhook'); ?></h3>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="enabled"><?php _e('Enable Plugin', 'nextjs-revalidation-webhook'); ?></label>
                        </th>
                        <td>
                            <label>
                                <input type="checkbox" id="enabled" name="enabled" value="1" <?php checked($settings['enabled']); ?>>
                                <?php _e('Enable automatic revalidation triggers', 'nextjs-revalidation-webhook'); ?>
                            </label>
                            <p class="description"><?php _e('When enabled, the plugin will automatically trigger revalidation when content changes.', 'nextjs-revalidation-webhook'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="webhook_url"><?php _e('Webhook URL', 'nextjs-revalidation-webhook'); ?> *</label>
                        </th>
                        <td>
                            <input type="url" id="webhook_url" name="webhook_url" value="<?php echo esc_attr($settings['webhook_url']); ?>" class="regular-text" required>
                            <p class="description">
                                <?php _e('Your Next.js revalidation endpoint URL, e.g., https://your-nextjs-app.com/api/revalidate', 'nextjs-revalidation-webhook'); ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="secret_token"><?php _e('Secret Token', 'nextjs-revalidation-webhook'); ?> *</label>
                        </th>
                        <td>
                            <input type="password" id="secret_token" name="secret_token" value="<?php echo esc_attr($settings['secret_token']); ?>" class="regular-text" required>
                            <p class="description">
                                <?php _e('The secret token that matches your HEADLESS_SECRET environment variable in Next.js', 'nextjs-revalidation-webhook'); ?>
                            </p>
                        </td>
                    </tr>
                </table>
                
                <h3><?php _e('Custom Revalidation', 'nextjs-revalidation-webhook'); ?></h3>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="custom_paths"><?php _e('Additional Paths', 'nextjs-revalidation-webhook'); ?></label>
                        </th>
                        <td>
                            <textarea id="custom_paths" name="custom_paths" rows="5" cols="50" class="large-text"><?php echo esc_textarea($settings['custom_paths']); ?></textarea>
                            <p class="description">
                                <?php _e('Additional paths to revalidate on every trigger (one per line), e.g., /, /blog, /about', 'nextjs-revalidation-webhook'); ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="custom_tags"><?php _e('Additional Tags', 'nextjs-revalidation-webhook'); ?></label>
                        </th>
                        <td>
                            <textarea id="custom_tags" name="custom_tags" rows="5" cols="50" class="large-text"><?php echo esc_textarea($settings['custom_tags']); ?></textarea>
                            <p class="description">
                                <?php _e('Additional cache tags to revalidate on every trigger (one per line), e.g., posts, pages, navigation', 'nextjs-revalidation-webhook'); ?>
                            </p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Triggers Tab -->
            <div id="tab-triggers" class="tab-content" style="display: none;">
                <h3><?php _e('Content Type Triggers', 'nextjs-revalidation-webhook'); ?></h3>
                
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('Automatic Triggers', 'nextjs-revalidation-webhook'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="auto_revalidate_posts" value="1" <?php checked($settings['auto_revalidate_posts']); ?>>
                                <?php _e('Posts', 'nextjs-revalidation-webhook'); ?>
                            </label><br>
                            
                            <label>
                                <input type="checkbox" name="auto_revalidate_pages" value="1" <?php checked($settings['auto_revalidate_pages']); ?>>
                                <?php _e('Pages', 'nextjs-revalidation-webhook'); ?>
                            </label><br>
                            
                            <label>
                                <input type="checkbox" name="auto_revalidate_custom_post_types" value="1" <?php checked($settings['auto_revalidate_custom_post_types']); ?>>
                                <?php _e('Custom Post Types', 'nextjs-revalidation-webhook'); ?>
                            </label>
                            
                            <p class="description"><?php _e('Select which content types should automatically trigger revalidation when updated.', 'nextjs-revalidation-webhook'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row"><?php _e('Action Triggers', 'nextjs-revalidation-webhook'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="revalidate_on_delete" value="1" <?php checked($settings['revalidate_on_delete']); ?>>
                                <?php _e('Trigger on content deletion', 'nextjs-revalidation-webhook'); ?>
                            </label><br>
                            
                            <label>
                                <input type="checkbox" name="revalidate_on_status_change" value="1" <?php checked($settings['revalidate_on_status_change']); ?>>
                                <?php _e('Trigger on status changes (publish, draft, etc.)', 'nextjs-revalidation-webhook'); ?>
                            </label>
                            
                            <p class="description"><?php _e('Configure when revalidation should be triggered based on content actions.', 'nextjs-revalidation-webhook'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="excluded_post_types"><?php _e('Excluded Post Types', 'nextjs-revalidation-webhook'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="excluded_post_types" name="excluded_post_types" value="<?php echo esc_attr($settings['excluded_post_types']); ?>" class="large-text">
                            <p class="description">
                                <?php _e('Comma-separated list of post types to exclude from automatic revalidation (e.g., revision,attachment,nav_menu_item)', 'nextjs-revalidation-webhook'); ?>
                            </p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Advanced Tab -->
            <div id="tab-advanced" class="tab-content" style="display: none;">
                <h3><?php _e('Rate Limiting', 'nextjs-revalidation-webhook'); ?></h3>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="rate_limit_enabled"><?php _e('Enable Rate Limiting', 'nextjs-revalidation-webhook'); ?></label>
                        </th>
                        <td>
                            <label>
                                <input type="checkbox" id="rate_limit_enabled" name="rate_limit_enabled" value="1" <?php checked($settings['rate_limit_enabled']); ?>>
                                <?php _e('Limit the number of webhook requests per time window', 'nextjs-revalidation-webhook'); ?>
                            </label>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="rate_limit_requests"><?php _e('Max Requests', 'nextjs-revalidation-webhook'); ?></label>
                        </th>
                        <td>
                            <input type="number" id="rate_limit_requests" name="rate_limit_requests" value="<?php echo esc_attr($settings['rate_limit_requests']); ?>" min="1" max="1000">
                            <p class="description"><?php _e('Maximum number of webhook requests allowed per time window', 'nextjs-revalidation-webhook'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="rate_limit_window"><?php _e('Time Window (seconds)', 'nextjs-revalidation-webhook'); ?></label>
                        </th>
                        <td>
                            <input type="number" id="rate_limit_window" name="rate_limit_window" value="<?php echo esc_attr($settings['rate_limit_window']); ?>" min="1" max="3600">
                            <p class="description"><?php _e('Time window in seconds for rate limiting', 'nextjs-revalidation-webhook'); ?></p>
                        </td>
                    </tr>
                </table>
                
                <h3><?php _e('Retry Settings', 'nextjs-revalidation-webhook'); ?></h3>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="retry_attempts"><?php _e('Retry Attempts', 'nextjs-revalidation-webhook'); ?></label>
                        </th>
                        <td>
                            <input type="number" id="retry_attempts" name="retry_attempts" value="<?php echo esc_attr($settings['retry_attempts']); ?>" min="1" max="10">
                            <p class="description"><?php _e('Number of times to retry failed webhook requests', 'nextjs-revalidation-webhook'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="retry_delay"><?php _e('Retry Delay (seconds)', 'nextjs-revalidation-webhook'); ?></label>
                        </th>
                        <td>
                            <input type="number" id="retry_delay" name="retry_delay" value="<?php echo esc_attr($settings['retry_delay']); ?>" min="1" max="60">
                            <p class="description"><?php _e('Delay in seconds between retry attempts', 'nextjs-revalidation-webhook'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="timeout"><?php _e('Request Timeout (seconds)', 'nextjs-revalidation-webhook'); ?></label>
                        </th>
                        <td>
                            <input type="number" id="timeout" name="timeout" value="<?php echo esc_attr($settings['timeout']); ?>" min="5" max="300">
                            <p class="description"><?php _e('Maximum time to wait for webhook response', 'nextjs-revalidation-webhook'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="verify_ssl"><?php _e('Verify SSL', 'nextjs-revalidation-webhook'); ?></label>
                        </th>
                        <td>
                            <label>
                                <input type="checkbox" id="verify_ssl" name="verify_ssl" value="1" <?php checked($settings['verify_ssl']); ?>>
                                <?php _e('Verify SSL certificates for webhook requests (recommended)', 'nextjs-revalidation-webhook'); ?>
                            </label>
                        </td>
                    </tr>
                </table>
                
                <h3><?php _e('Logging', 'nextjs-revalidation-webhook'); ?></h3>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="log_enabled"><?php _e('Enable Logging', 'nextjs-revalidation-webhook'); ?></label>
                        </th>
                        <td>
                            <label>
                                <input type="checkbox" id="log_enabled" name="log_enabled" value="1" <?php checked($settings['log_enabled']); ?>>
                                <?php _e('Log webhook requests and responses for debugging', 'nextjs-revalidation-webhook'); ?>
                            </label>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="log_retention_days"><?php _e('Log Retention (days)', 'nextjs-revalidation-webhook'); ?></label>
                        </th>
                        <td>
                            <input type="number" id="log_retention_days" name="log_retention_days" value="<?php echo esc_attr($settings['log_retention_days']); ?>" min="1" max="365">
                            <p class="description"><?php _e('Number of days to keep webhook logs before automatic cleanup', 'nextjs-revalidation-webhook'); ?></p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Logs Tab -->
            <div id="tab-logs" class="tab-content" style="display: none;">
                <div class="logs-header">
                    <h3><?php _e('Recent Webhook Logs', 'nextjs-revalidation-webhook'); ?></h3>
                    
                    <div class="logs-actions">
                        <button type="button" id="test-webhook" class="button button-secondary">
                            <?php _e('Test Webhook', 'nextjs-revalidation-webhook'); ?>
                        </button>
                        <button type="button" id="clear-logs" class="button button-secondary">
                            <?php _e('Clear All Logs', 'nextjs-revalidation-webhook'); ?>
                        </button>
                        <button type="button" id="refresh-logs" class="button button-secondary">
                            <?php _e('Refresh', 'nextjs-revalidation-webhook'); ?>
                        </button>
                    </div>
                </div>
                
                <div id="logs-container">
                    <?php if (empty($recent_logs)): ?>
                        <p><?php _e('No logs found. Webhook requests will be logged here when they occur.', 'nextjs-revalidation-webhook'); ?></p>
                    <?php else: ?>
                        <table class="wp-list-table widefat fixed striped">
                            <thead>
                                <tr>
                                    <th><?php _e('Time', 'nextjs-revalidation-webhook'); ?></th>
                                    <th><?php _e('Post ID', 'nextjs-revalidation-webhook'); ?></th>
                                    <th><?php _e('Action', 'nextjs-revalidation-webhook'); ?></th>
                                    <th><?php _e('Status', 'nextjs-revalidation-webhook'); ?></th>
                                    <th><?php _e('Response Code', 'nextjs-revalidation-webhook'); ?></th>
                                    <th><?php _e('Processing Time', 'nextjs-revalidation-webhook'); ?></th>
                                    <th><?php _e('Retries', 'nextjs-revalidation-webhook'); ?></th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($recent_logs as $log): ?>
                                    <tr class="log-row log-status-<?php echo esc_attr($log->status); ?>">
                                        <td><?php echo esc_html(date('Y-m-d H:i:s', strtotime($log->created_at))); ?></td>
                                        <td><?php echo $log->post_id ? esc_html($log->post_id) : '-'; ?></td>
                                        <td><?php echo esc_html($log->action); ?></td>
                                        <td>
                                            <span class="status-badge status-<?php echo esc_attr($log->status); ?>">
                                                <?php echo esc_html(ucfirst($log->status)); ?>
                                            </span>
                                        </td>
                                        <td><?php echo esc_html($log->response_code ?: '-'); ?></td>
                                        <td><?php echo $log->processing_time ? esc_html(round($log->processing_time, 2) . 'ms') : '-'; ?></td>
                                        <td><?php echo esc_html($log->retry_count); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Help Tab -->
            <div id="tab-help" class="tab-content" style="display: none;">
                <h3><?php _e('Setup Instructions', 'nextjs-revalidation-webhook'); ?></h3>
                
                <div class="help-section">
                    <h4><?php _e('1. Configure Your Next.js Application', 'nextjs-revalidation-webhook'); ?></h4>
                    <p><?php _e('Add the following environment variables to your Next.js application:', 'nextjs-revalidation-webhook'); ?></p>
                    <pre><code>HEADLESS_SECRET=your-secret-token-here
WEBHOOK_ALLOWED_IPS=your-wordpress-server-ip
WEBHOOK_RATE_LIMIT_MAX=30
WEBHOOK_RATE_LIMIT_WINDOW=60000</code></pre>
                </div>
                
                <div class="help-section">
                    <h4><?php _e('2. Plugin Configuration', 'nextjs-revalidation-webhook'); ?></h4>
                    <ul>
                        <li><?php _e('<strong>Webhook URL:</strong> Your Next.js revalidation endpoint, typically /api/revalidate', 'nextjs-revalidation-webhook'); ?></li>
                        <li><?php _e('<strong>Secret Token:</strong> Must match the HEADLESS_SECRET in your Next.js environment', 'nextjs-revalidation-webhook'); ?></li>
                        <li><?php _e('<strong>Triggers:</strong> Choose which content types and actions should trigger revalidation', 'nextjs-revalidation-webhook'); ?></li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4><?php _e('3. Testing', 'nextjs-revalidation-webhook'); ?></h4>
                    <p><?php _e('Use the "Test Webhook" button in the Logs tab to verify your configuration is working correctly.', 'nextjs-revalidation-webhook'); ?></p>
                </div>
                
                <div class="help-section">
                    <h4><?php _e('4. Manual Triggers', 'nextjs-revalidation-webhook'); ?></h4>
                    <p><?php _e('You can manually trigger revalidation using:', 'nextjs-revalidation-webhook'); ?></p>
                    <ul>
                        <li><?php _e('<strong>REST API:</strong> POST to /wp-json/nextjs-revalidation/v1/trigger', 'nextjs-revalidation-webhook'); ?></li>
                        <li><?php _e('<strong>WP-CLI:</strong> wp nextjs-revalidate trigger --post_id=123', 'nextjs-revalidation-webhook'); ?></li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4><?php _e('5. Troubleshooting', 'nextjs-revalidation-webhook'); ?></h4>
                    <ul>
                        <li><?php _e('Check the Logs tab for detailed error messages', 'nextjs-revalidation-webhook'); ?></li>
                        <li><?php _e('Verify your Next.js application is accessible from your WordPress server', 'nextjs-revalidation-webhook'); ?></li>
                        <li><?php _e('Ensure SSL certificates are valid if using HTTPS', 'nextjs-revalidation-webhook'); ?></li>
                        <li><?php _e('Check rate limiting settings if requests are being blocked', 'nextjs-revalidation-webhook'); ?></li>
                    </ul>
                </div>
            </div>

            <p class="submit">
                <input type="submit" name="submit" id="submit" class="button button-primary" value="<?php _e('Save Changes', 'nextjs-revalidation-webhook'); ?>">
            </p>
        </form>
    </div>
</div>

<style>
.nav-tab-wrapper {
    margin-bottom: 20px;
}

.tab-content {
    background: #fff;
    padding: 20px;
    border: 1px solid #ccd0d4;
    box-shadow: 0 1px 1px rgba(0,0,0,.04);
}

.logs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.logs-actions button {
    margin-left: 10px;
}

.log-row.log-status-success {
    background-color: #f0f8f0;
}

.log-row.log-status-error {
    background-color: #fdf2f2;
}

.log-row.log-status-retry {
    background-color: #fefcf0;
}

.status-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
}

.status-success {
    background-color: #46b450;
    color: white;
}

.status-error {
    background-color: #dc3232;
    color: white;
}

.status-retry {
    background-color: #ffb900;
    color: white;
}

.help-section {
    margin-bottom: 30px;
}

.help-section h4 {
    color: #23282d;
    margin-bottom: 10px;
}

.help-section pre {
    background: #f6f7f7;
    padding: 15px;
    border-left: 4px solid #0073aa;
    overflow-x: auto;
}

.help-section ul {
    margin-left: 20px;
}

.help-section li {
    margin-bottom: 5px;
}

#logs-container {
    min-height: 200px;
}

.logs-loading {
    text-align: center;
    padding: 40px;
    color: #666;
}
</style>

<script>
jQuery(document).ready(function($) {
    // Tab functionality
    $('.nav-tab').on('click', function(e) {
        e.preventDefault();
        
        // Update tab appearance
        $('.nav-tab').removeClass('nav-tab-active');
        $(this).addClass('nav-tab-active');
        
        // Show/hide content
        $('.tab-content').hide();
        $($(this).attr('href')).show();
    });
    
    // Test webhook
    $('#test-webhook').on('click', function() {
        var $button = $(this);
        var originalText = $button.text();
        
        $button.prop('disabled', true).text('<?php _e('Testing...', 'nextjs-revalidation-webhook'); ?>');
        
        $.ajax({
            url: ajaxurl,
            method: 'POST',
            data: {
                action: 'test_webhook',
                _ajax_nonce: '<?php echo wp_create_nonce('nextjs_webhook_test'); ?>'
            },
            success: function(response) {
                if (response.success) {
                    alert('<?php _e('Test webhook sent successfully!', 'nextjs-revalidation-webhook'); ?>');
                } else {
                    alert('<?php _e('Test failed: ', 'nextjs-revalidation-webhook'); ?>' + response.data.message);
                }
            },
            error: function() {
                alert('<?php _e('Test failed due to a network error.', 'nextjs-revalidation-webhook'); ?>');
            },
            complete: function() {
                $button.prop('disabled', false).text(originalText);
                // Refresh logs after test
                setTimeout(function() {
                    location.reload();
                }, 1000);
            }
        });
    });
    
    // Clear logs
    $('#clear-logs').on('click', function() {
        if (!confirm('<?php _e('Are you sure you want to clear all logs?', 'nextjs-revalidation-webhook'); ?>')) {
            return;
        }
        
        var $button = $(this);
        var originalText = $button.text();
        
        $button.prop('disabled', true).text('<?php _e('Clearing...', 'nextjs-revalidation-webhook'); ?>');
        
        $.ajax({
            url: ajaxurl,
            method: 'POST',
            data: {
                action: 'clear_logs',
                _ajax_nonce: '<?php echo wp_create_nonce('nextjs_webhook_clear_logs'); ?>'
            },
            success: function(response) {
                if (response.success) {
                    alert('<?php _e('Logs cleared successfully!', 'nextjs-revalidation-webhook'); ?>');
                    location.reload();
                } else {
                    alert('<?php _e('Failed to clear logs: ', 'nextjs-revalidation-webhook'); ?>' + response.data.message);
                }
            },
            error: function() {
                alert('<?php _e('Failed to clear logs due to a network error.', 'nextjs-revalidation-webhook'); ?>');
            },
            complete: function() {
                $button.prop('disabled', false).text(originalText);
            }
        });
    });
    
    // Refresh logs
    $('#refresh-logs').on('click', function() {
        location.reload();
    });
});
</script>