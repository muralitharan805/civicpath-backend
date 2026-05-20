module.exports = {
  apps: [
    {
      name: 'civicpath-backend',
      script: 'dist/main.js',
      
      // Cluster mode configuration
      instances: 2,
      exec_mode: 'cluster',
      
      // Zero-downtime configuration
      wait_ready: true,      // Wait for process.send('ready') before accepting traffic
      listen_timeout: 10000, // Maximum time (ms) to wait for the ready signal
      kill_timeout: 5000,    // Time (ms) given to the app to gracefully shut down before forceful kill
      
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
