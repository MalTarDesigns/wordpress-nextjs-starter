<?php
/**
 * Plugin Name: Next.js Revalidation Webhook
 * Plugin URI: https://github.com/your-username/nextjs-revalidation-webhook
 * Description: Automatically triggers Next.js ISR revalidation when WordPress content is updated
 * Version: 2.0.0
 * Author: Your Name
 * License: MIT
 * Text Domain: nextjs-revalidation-webhook
 * Domain Path: /languages
 * 
 * @package NextJSRevalidationWebhook
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class NextJSRevalidationWebhook {
    
    /**
     * Plugin version
     */
    const VERSION = '2.0.0';
    
    /**
     * Plugin instance
     */
    private static $instance = null;
    
    /**
     * Options key
     */
    const OPTIONS_KEY = 'nextjs_revalidation_webhook_settings';
    
    /**
     * Default settings
     */
    private $default_settings = [
        'webhook_url' => '',
        'secret_token' => '',
        'enabled' => false,
        'auto_revalidate_posts' => true,
        'auto_revalidate_pages' => true,
        'auto_revalidate_custom_post_types' => true,
        'revalidate_on_delete' => true,
        'revalidate_on_status_change' => true,
        'custom_paths' => '',
        'custom_tags' => '',
        'rate_limit_enabled' => true,
        'rate_limit_requests' => 10,
        'rate_limit_window' => 60,
        'retry_attempts' => 3,
        'retry_delay' => 5,
        'log_enabled' => true,
        'log_retention_days' => 30,
        'timeout' => 30,
        'verify_ssl' => true,
        'excluded_post_types' => 'revision,attachment,nav_menu_item',
    ];
    
    /**
     * Get singleton instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        add_action('init', [$this, 'init']);
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);
    }
    
    /**
     * Initialize the plugin
     */
    public function init() {
        // Load textdomain
        load_plugin_textdomain('nextjs-revalidation-webhook', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Admin interface
        if (is_admin()) {
            add_action('admin_menu', [$this, 'add_admin_menu']);
            add_action('admin_init', [$this, 'register_settings']);
            add_action('admin_notices', [$this, 'admin_notices']);
            add_action('wp_ajax_test_webhook', [$this, 'test_webhook']);
            add_action('wp_ajax_clear_logs', [$this, 'clear_logs']);
        }
        
        // Hook into content updates
        $this->register_content_hooks();
        
        // Add custom REST endpoints
        add_action('rest_api_init', [$this, 'register_rest_endpoints']);
        
        // Add CLI commands if WP-CLI is available
        if (defined('WP_CLI') && WP_CLI) {
            WP_CLI::add_command('nextjs-revalidate', [$this, 'cli_commands']);
        }
        
        // Cron for log cleanup
        add_action('nextjs_revalidation_cleanup_logs', [$this, 'cleanup_old_logs']);
        if (!wp_next_scheduled('nextjs_revalidation_cleanup_logs')) {
            wp_schedule_event(time(), 'daily', 'nextjs_revalidation_cleanup_logs');
        }
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Create logs table
        $this->create_logs_table();
        
        // Set default options
        if (!get_option(self::OPTIONS_KEY)) {
            add_option(self::OPTIONS_KEY, $this->default_settings);
        }
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Clear scheduled events
        wp_clear_scheduled_hook('nextjs_revalidation_cleanup_logs');
    }
    
    /**
     * Create logs database table
     */
    private function create_logs_table() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'nextjs_revalidation_logs';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            post_id bigint(20) UNSIGNED NULL,
            post_type varchar(20) NOT NULL DEFAULT '',
            action varchar(50) NOT NULL DEFAULT '',
            webhook_url text NOT NULL,
            request_data longtext NULL,
            response_code int(4) NOT NULL DEFAULT 0,
            response_message text NULL,
            processing_time float NULL,
            status enum('success', 'error', 'retry') NOT NULL DEFAULT 'success',
            retry_count int(2) NOT NULL DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY post_id (post_id),
            KEY post_type (post_type),
            KEY action (action),
            KEY status (status),
            KEY timestamp (timestamp)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * Register content update hooks
     */
    private function register_content_hooks() {
        $settings = get_option(self::OPTIONS_KEY, $this->default_settings);
        
        if (!$settings['enabled']) {
            return;
        }
        
        // Post/Page save hooks
        add_action('save_post', [$this, 'on_content_save'], 10, 3);
        add_action('wp_trash_post', [$this, 'on_content_delete']);
        add_action('delete_post', [$this, 'on_content_delete']);
        add_action('transition_post_status', [$this, 'on_post_status_change'], 10, 3);
        
        // Comment hooks
        add_action('wp_insert_comment', [$this, 'on_comment_change']);
        add_action('wp_set_comment_status', [$this, 'on_comment_change']);
        
        // Term hooks (categories, tags)
        add_action('created_term', [$this, 'on_term_change'], 10, 3);
        add_action('edited_term', [$this, 'on_term_change'], 10, 3);
        add_action('delete_term', [$this, 'on_term_change'], 10, 3);
        
        // Menu hooks
        add_action('wp_update_nav_menu', [$this, 'on_menu_change']);
        
        // Theme customizer
        add_action('customize_save_after', [$this, 'on_customizer_save']);
        
        // Plugin/theme activation
        add_action('activated_plugin', [$this, 'on_plugin_theme_change']);
        add_action('deactivated_plugin', [$this, 'on_plugin_theme_change']);
        add_action('switch_theme', [$this, 'on_plugin_theme_change']);
    }
    
    /**
     * Handle content save
     */
    public function on_content_save($post_id, $post, $update) {
        // Skip autosaves and revisions
        if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
            return;
        }
        
        $settings = get_option(self::OPTIONS_KEY, $this->default_settings);
        
        // Check if this post type should trigger revalidation
        if (!$this->should_revalidate_post_type($post->post_type, $settings)) {
            return;
        }
        
        // Skip if post is not published and we're not tracking status changes
        if ($post->post_status !== 'publish' && !$settings['revalidate_on_status_change']) {
            return;
        }
        
        $action = $update ? 'update' : 'create';
        if ($post->post_status === 'publish') {
            $action = 'publish';
        }
        
        $this->trigger_revalidation([
            'post_id' => $post_id,
            'post_type' => $post->post_type,
            'post_status' => $post->post_status,
            'post_title' => $post->post_title,
            'post_slug' => $post->post_name,
            'post_parent' => $post->post_parent,
            'action' => $action,
            'user_id' => get_current_user_id(),
            'timestamp' => time(),
        ]);
    }
    
    /**
     * Handle content deletion
     */
    public function on_content_delete($post_id) {
        $post = get_post($post_id);
        if (!$post) return;
        
        $settings = get_option(self::OPTIONS_KEY, $this->default_settings);
        
        if (!$settings['revalidate_on_delete'] || !$this->should_revalidate_post_type($post->post_type, $settings)) {
            return;
        }
        
        $this->trigger_revalidation([
            'post_id' => $post_id,
            'post_type' => $post->post_type,
            'post_status' => $post->post_status,
            'post_title' => $post->post_title,
            'post_slug' => $post->post_name,
            'action' => 'delete',
            'user_id' => get_current_user_id(),
            'timestamp' => time(),
        ]);
    }
    
    /**
     * Handle post status changes
     */
    public function on_post_status_change($new_status, $old_status, $post) {
        if ($new_status === $old_status) return;
        
        $settings = get_option(self::OPTIONS_KEY, $this->default_settings);
        
        if (!$settings['revalidate_on_status_change'] || !$this->should_revalidate_post_type($post->post_type, $settings)) {
            return;
        }
        
        $action = 'update';
        if ($new_status === 'publish' && $old_status !== 'publish') {
            $action = 'publish';
        } elseif ($old_status === 'publish' && $new_status !== 'publish') {
            $action = 'unpublish';
        }
        
        $this->trigger_revalidation([
            'post_id' => $post->ID,
            'post_type' => $post->post_type,
            'post_status' => $new_status,
            'post_title' => $post->post_title,
            'post_slug' => $post->post_name,
            'action' => $action,
            'user_id' => get_current_user_id(),
            'timestamp' => time(),
        ]);
    }
    
    /**
     * Handle comment changes
     */
    public function on_comment_change($comment_id) {
        $comment = get_comment($comment_id);
        if (!$comment) return;
        
        $post = get_post($comment->comment_post_ID);
        if (!$post || $post->post_status !== 'publish') return;
        
        $this->trigger_revalidation([
            'post_id' => $post->ID,
            'post_type' => $post->post_type,
            'action' => 'comment_update',
            'user_id' => get_current_user_id(),
            'timestamp' => time(),
        ]);
    }
    
    /**
     * Handle term changes
     */
    public function on_term_change($term_id, $taxonomy = null, $args = null) {
        $this->trigger_revalidation([
            'taxonomy' => $taxonomy,
            'term_id' => $term_id,
            'action' => 'term_update',
            'user_id' => get_current_user_id(),
            'timestamp' => time(),
        ]);
    }
    
    /**
     * Handle menu changes
     */
    public function on_menu_change($menu_id) {
        $this->trigger_revalidation([
            'action' => 'menu_update',
            'menu_id' => $menu_id,
            'user_id' => get_current_user_id(),
            'timestamp' => time(),
        ]);
    }
    
    /**
     * Handle customizer saves
     */
    public function on_customizer_save($customizer) {
        $this->trigger_revalidation([
            'action' => 'customizer_update',
            'user_id' => get_current_user_id(),
            'timestamp' => time(),
        ]);
    }
    
    /**
     * Handle plugin/theme changes
     */
    public function on_plugin_theme_change() {
        $this->trigger_revalidation([
            'action' => 'plugin_theme_change',
            'user_id' => get_current_user_id(),
            'timestamp' => time(),
        ]);
    }
    
    /**
     * Check if post type should trigger revalidation
     */
    private function should_revalidate_post_type($post_type, $settings) {
        $excluded_types = array_map('trim', explode(',', $settings['excluded_post_types']));
        
        if (in_array($post_type, $excluded_types)) {
            return false;
        }
        
        if ($post_type === 'post' && $settings['auto_revalidate_posts']) {
            return true;
        }
        
        if ($post_type === 'page' && $settings['auto_revalidate_pages']) {
            return true;
        }
        
        if (!in_array($post_type, ['post', 'page']) && $settings['auto_revalidate_custom_post_types']) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Trigger revalidation
     */
    public function trigger_revalidation($data, $custom_paths = [], $custom_tags = []) {
        $settings = get_option(self::OPTIONS_KEY, $this->default_settings);
        
        if (empty($settings['webhook_url']) || empty($settings['secret_token'])) {
            return false;
        }
        
        // Rate limiting check
        if ($settings['rate_limit_enabled'] && !$this->check_rate_limit($settings)) {
            $this->log_webhook_call($data, 0, 'Rate limit exceeded', 'error');
            return false;
        }
        
        // Build payload
        $payload = array_merge($data, [
            'site_url' => get_site_url(),
            'blog_id' => get_current_blog_id(),
        ]);
        
        // Add custom paths and tags from settings
        if (!empty($settings['custom_paths'])) {
            $custom_paths = array_merge($custom_paths, array_map('trim', explode('\n', $settings['custom_paths'])));
        }
        
        if (!empty($settings['custom_tags'])) {
            $custom_tags = array_merge($custom_tags, array_map('trim', explode('\n', $settings['custom_tags'])));
        }
        
        // Send request with retry logic
        $retry_count = 0;
        $max_retries = max(1, intval($settings['retry_attempts']));
        
        do {
            $result = $this->send_webhook_request($settings['webhook_url'], $payload, $settings);
            
            if ($result['success']) {
                $this->log_webhook_call($data, $result['response_code'], $result['message'], 'success', $result['processing_time'], $retry_count);
                return true;
            }
            
            $retry_count++;
            if ($retry_count < $max_retries) {
                sleep(intval($settings['retry_delay']));
                $this->log_webhook_call($data, $result['response_code'], $result['message'], 'retry', $result['processing_time'], $retry_count);
            }
            
        } while ($retry_count < $max_retries);
        
        // Final failure log
        $this->log_webhook_call($data, $result['response_code'], $result['message'], 'error', $result['processing_time'], $retry_count);
        return false;
    }
    
    /**
     * Send webhook request
     */
    private function send_webhook_request($url, $payload, $settings) {
        $start_time = microtime(true);
        
        $headers = [
            'Content-Type' => 'application/json',
            'X-Headless-Secret-Key' => $settings['secret_token'],
            'X-WordPress-Webhook' => 'true',
            'User-Agent' => 'WordPress NextJS Revalidation Webhook/' . self::VERSION,
        ];
        
        $args = [
            'body' => json_encode($payload),
            'headers' => $headers,
            'timeout' => intval($settings['timeout']),
            'method' => 'POST',
            'sslverify' => $settings['verify_ssl'],
            'blocking' => true,
        ];
        
        $response = wp_remote_request($url, $args);
        $processing_time = (microtime(true) - $start_time) * 1000;
        
        if (is_wp_error($response)) {
            return [
                'success' => false,
                'response_code' => 0,
                'message' => $response->get_error_message(),
                'processing_time' => $processing_time,
            ];
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        $success = $response_code >= 200 && $response_code < 300;
        
        return [
            'success' => $success,
            'response_code' => $response_code,
            'message' => $success ? 'Success' : $response_body,
            'processing_time' => $processing_time,
        ];
    }
    
    /**
     * Check rate limit
     */
    private function check_rate_limit($settings) {
        $rate_limit_key = 'nextjs_revalidation_rate_limit';
        $current_time = time();
        $window = intval($settings['rate_limit_window']);
        $max_requests = intval($settings['rate_limit_requests']);
        
        $rate_data = get_transient($rate_limit_key) ?: ['count' => 0, 'window_start' => $current_time];
        
        // Reset window if expired
        if ($current_time - $rate_data['window_start'] > $window) {
            $rate_data = ['count' => 0, 'window_start' => $current_time];
        }
        
        // Check limit
        if ($rate_data['count'] >= $max_requests) {
            return false;
        }
        
        // Increment count
        $rate_data['count']++;
        set_transient($rate_limit_key, $rate_data, $window);
        
        return true;
    }
    
    /**
     * Log webhook call
     */
    private function log_webhook_call($data, $response_code, $message, $status, $processing_time = null, $retry_count = 0) {
        $settings = get_option(self::OPTIONS_KEY, $this->default_settings);
        
        if (!$settings['log_enabled']) {
            return;
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'nextjs_revalidation_logs';
        
        $wpdb->insert(
            $table_name,
            [
                'post_id' => isset($data['post_id']) ? $data['post_id'] : null,
                'post_type' => isset($data['post_type']) ? $data['post_type'] : '',
                'action' => isset($data['action']) ? $data['action'] : '',
                'webhook_url' => $settings['webhook_url'],
                'request_data' => json_encode($data),
                'response_code' => $response_code,
                'response_message' => $message,
                'processing_time' => $processing_time,
                'status' => $status,
                'retry_count' => $retry_count,
            ],
            ['%d', '%s', '%s', '%s', '%s', '%d', '%s', '%f', '%s', '%d']
        );
    }
    
    /**
     * Cleanup old logs
     */
    public function cleanup_old_logs() {
        $settings = get_option(self::OPTIONS_KEY, $this->default_settings);
        
        if (!$settings['log_enabled'] || $settings['log_retention_days'] <= 0) {
            return;
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'nextjs_revalidation_logs';
        
        $wpdb->query($wpdb->prepare(
            "DELETE FROM $table_name WHERE created_at < DATE_SUB(NOW(), INTERVAL %d DAY)",
            $settings['log_retention_days']
        ));
    }
    
    /**
     * Register REST endpoints
     */
    public function register_rest_endpoints() {
        register_rest_route('nextjs-revalidation/v1', '/trigger', [
            'methods' => 'POST',
            'callback' => [$this, 'rest_trigger_revalidation'],
            'permission_callback' => function() {
                return current_user_can('manage_options');
            },
        ]);
        
        register_rest_route('nextjs-revalidation/v1', '/logs', [
            'methods' => 'GET',
            'callback' => [$this, 'rest_get_logs'],
            'permission_callback' => function() {
                return current_user_can('manage_options');
            },
        ]);
    }
    
    /**
     * REST endpoint for triggering revalidation
     */
    public function rest_trigger_revalidation($request) {
        $params = $request->get_json_params();
        
        $data = [
            'action' => 'manual_trigger',
            'user_id' => get_current_user_id(),
            'timestamp' => time(),
        ];
        
        if (isset($params['post_id'])) {
            $post = get_post($params['post_id']);
            if ($post) {
                $data['post_id'] = $post->ID;
                $data['post_type'] = $post->post_type;
                $data['post_title'] = $post->post_title;
            }
        }
        
        $result = $this->trigger_revalidation($data, $params['paths'] ?? [], $params['tags'] ?? []);
        
        return new WP_REST_Response([
            'success' => $result,
            'message' => $result ? 'Revalidation triggered successfully' : 'Failed to trigger revalidation',
        ], $result ? 200 : 500);
    }
    
    /**
     * REST endpoint for getting logs
     */
    public function rest_get_logs($request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'nextjs_revalidation_logs';
        
        $page = max(1, intval($request->get_param('page') ?: 1));
        $per_page = min(100, max(10, intval($request->get_param('per_page') ?: 20)));
        $offset = ($page - 1) * $per_page;
        
        $logs = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name ORDER BY created_at DESC LIMIT %d OFFSET %d",
            $per_page,
            $offset
        ));
        
        $total = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
        
        return new WP_REST_Response([
            'logs' => $logs,
            'pagination' => [
                'page' => $page,
                'per_page' => $per_page,
                'total' => intval($total),
                'pages' => ceil($total / $per_page),
            ],
        ]);
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            __('Next.js Revalidation Webhook', 'nextjs-revalidation-webhook'),
            __('Next.js Webhook', 'nextjs-revalidation-webhook'),
            'manage_options',
            'nextjs-revalidation-webhook',
            [$this, 'admin_page']
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('nextjs_revalidation_webhook', self::OPTIONS_KEY);
    }
    
    /**
     * Admin notices
     */
    public function admin_notices() {
        $settings = get_option(self::OPTIONS_KEY, $this->default_settings);
        
        if (empty($settings['webhook_url']) || empty($settings['secret_token'])) {
            echo '<div class="notice notice-warning is-dismissible">
                <p>' . __('Next.js Revalidation Webhook is not configured. Please set your webhook URL and secret token in the settings.', 'nextjs-revalidation-webhook') . '</p>
            </div>';
        }
    }
    
    /**
     * Test webhook AJAX handler
     */
    public function test_webhook() {
        check_ajax_referer('nextjs_webhook_test');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $result = $this->trigger_revalidation([
            'action' => 'test',
            'user_id' => get_current_user_id(),
            'timestamp' => time(),
            'message' => 'This is a test webhook call',
        ]);
        
        wp_send_json([
            'success' => $result,
            'message' => $result ? 'Test webhook sent successfully!' : 'Failed to send test webhook. Check the logs for details.',
        ]);
    }
    
    /**
     * Clear logs AJAX handler
     */
    public function clear_logs() {
        check_ajax_referer('nextjs_webhook_clear_logs');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'nextjs_revalidation_logs';
        $result = $wpdb->query("TRUNCATE TABLE $table_name");
        
        wp_send_json([
            'success' => $result !== false,
            'message' => $result !== false ? 'Logs cleared successfully!' : 'Failed to clear logs.',
        ]);
    }
    
    /**
     * Admin page
     */
    public function admin_page() {
        $settings = get_option(self::OPTIONS_KEY, $this->default_settings);
        
        if (isset($_POST['submit'])) {
            check_admin_referer('nextjs_revalidation_webhook_settings');
            
            $new_settings = array_merge($this->default_settings, [
                'webhook_url' => sanitize_url($_POST['webhook_url'] ?? ''),
                'secret_token' => sanitize_text_field($_POST['secret_token'] ?? ''),
                'enabled' => isset($_POST['enabled']),
                'auto_revalidate_posts' => isset($_POST['auto_revalidate_posts']),
                'auto_revalidate_pages' => isset($_POST['auto_revalidate_pages']),
                'auto_revalidate_custom_post_types' => isset($_POST['auto_revalidate_custom_post_types']),
                'revalidate_on_delete' => isset($_POST['revalidate_on_delete']),
                'revalidate_on_status_change' => isset($_POST['revalidate_on_status_change']),
                'custom_paths' => sanitize_textarea_field($_POST['custom_paths'] ?? ''),
                'custom_tags' => sanitize_textarea_field($_POST['custom_tags'] ?? ''),
                'rate_limit_enabled' => isset($_POST['rate_limit_enabled']),
                'rate_limit_requests' => max(1, intval($_POST['rate_limit_requests'] ?? 10)),
                'rate_limit_window' => max(1, intval($_POST['rate_limit_window'] ?? 60)),
                'retry_attempts' => max(1, intval($_POST['retry_attempts'] ?? 3)),
                'retry_delay' => max(1, intval($_POST['retry_delay'] ?? 5)),
                'log_enabled' => isset($_POST['log_enabled']),
                'log_retention_days' => max(1, intval($_POST['log_retention_days'] ?? 30)),
                'timeout' => max(5, intval($_POST['timeout'] ?? 30)),
                'verify_ssl' => isset($_POST['verify_ssl']),
                'excluded_post_types' => sanitize_text_field($_POST['excluded_post_types'] ?? ''),
            ]);
            
            update_option(self::OPTIONS_KEY, $new_settings);
            $settings = $new_settings;
            
            echo '<div class="notice notice-success is-dismissible"><p>' . __('Settings saved!', 'nextjs-revalidation-webhook') . '</p></div>';
        }
        
        // Get recent logs
        global $wpdb;
        $table_name = $wpdb->prefix . 'nextjs_revalidation_logs';
        $recent_logs = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC LIMIT 10");
        
        include plugin_dir_path(__FILE__) . 'admin-page.php';
    }
    
    /**
     * CLI commands
     */
    public function cli_commands($args, $assoc_args) {
        $command = $args[0] ?? 'help';
        
        switch ($command) {
            case 'test':
                WP_CLI::line('Sending test webhook...');
                $result = $this->trigger_revalidation([
                    'action' => 'cli_test',
                    'user_id' => 0,
                    'timestamp' => time(),
                ]);
                WP_CLI::success($result ? 'Test webhook sent successfully!' : 'Failed to send test webhook.');
                break;
                
            case 'logs':
                $this->cli_show_logs($assoc_args);
                break;
                
            case 'clear-logs':
                $this->cleanup_old_logs();
                WP_CLI::success('Old logs cleared.');
                break;
                
            case 'trigger':
                $post_id = $assoc_args['post_id'] ?? null;
                if ($post_id) {
                    $post = get_post($post_id);
                    if ($post) {
                        $result = $this->trigger_revalidation([
                            'post_id' => $post->ID,
                            'post_type' => $post->post_type,
                            'action' => 'cli_manual',
                            'timestamp' => time(),
                        ]);
                        WP_CLI::success($result ? "Revalidation triggered for post ID $post_id" : "Failed to trigger revalidation for post ID $post_id");
                    } else {
                        WP_CLI::error("Post ID $post_id not found.");
                    }
                } else {
                    WP_CLI::error('Please provide --post_id parameter.');
                }
                break;
                
            default:
                WP_CLI::line('Available commands:');
                WP_CLI::line('  test - Send a test webhook');
                WP_CLI::line('  logs - Show recent logs');
                WP_CLI::line('  clear-logs - Clear old logs');
                WP_CLI::line('  trigger --post_id=<id> - Trigger revalidation for specific post');
                break;
        }
    }
    
    /**
     * CLI show logs
     */
    private function cli_show_logs($assoc_args) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'nextjs_revalidation_logs';
        
        $limit = intval($assoc_args['limit'] ?? 10);
        $logs = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name ORDER BY created_at DESC LIMIT %d",
            $limit
        ));
        
        if (empty($logs)) {
            WP_CLI::line('No logs found.');
            return;
        }
        
        $table = [];
        foreach ($logs as $log) {
            $table[] = [
                'ID' => $log->id,
                'Time' => $log->created_at,
                'Post ID' => $log->post_id ?: '-',
                'Action' => $log->action,
                'Status' => $log->status,
                'Response' => $log->response_code,
                'Time (ms)' => round($log->processing_time, 2),
            ];
        }
        
        WP_CLI\Utils\format_items('table', $table, array_keys($table[0]));
    }
}

// Initialize the plugin
NextJSRevalidationWebhook::getInstance();