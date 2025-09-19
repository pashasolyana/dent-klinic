module.exports = {
  apps: [
    {
      name: 'nuxt-app',
      script: 'node',
      args: '.output/server/index.mjs',
      cwd: '/var/www/app/dent-klinic',
      env_file: '/var/www/app/dent-klinic/.env'
    }
  ]
}
