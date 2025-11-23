module.exports = {
  apps: [
    {
      name: 'flotteq-api',
      script: 'dist/main.js',
      cwd: '/opt/flotteq/backend',

      // Instances & mode
      instances: 'max', // Utilise tous les CPU disponibles
      exec_mode: 'cluster', // Mode cluster pour load balancing

      // Watch & reload
      watch: false, // Pas de watch en production
      ignore_watch: ['node_modules', 'uploads', 'logs'],

      // Environment
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Logs
      error_file: '/var/log/flotteq/api-error.log',
      out_file: '/var/log/flotteq/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Auto-restart
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Cron restart (optionnel - redémarrage quotidien à 4h)
      cron_restart: '0 4 * * *',

      // Instance vars
      instance_var: 'INSTANCE_ID',
    },
  ],
};
