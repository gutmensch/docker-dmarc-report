#!/usr/bin/env bash

# Display PHP error's or not
if [[ "$ERRORS" != "1" ]] ; then
  sed -i -e "s/error_reporting =.*/error_reporting = E_ALL/g" /etc/php8/php.ini
  sed -i -e "s/display_errors =.*/display_errors = stdout/g" /etc/php8/php.ini
fi

# Disable opcache?
if [[ -v NO_OPCACHE ]]; then
    sed -i -e "s/zend_extension=opcache.so/;zend_extension=opcache.so/g" /etc/php8/conf.d/00_opcache.ini
fi

# Tweak nginx to match the workers to cpu's
procs=$(cat /proc/cpuinfo | grep processor | wc -l)
sed -i -e "s/worker_processes 5/worker_processes $procs/" /etc/nginx/nginx.conf

# Copy important env vars for PHP-FPM to access
PHP_ENV_FILE="/etc/php8/php-fpm.d/${PHP_ENV_FILE:-env.conf}"
echo '[www]' > "$PHP_ENV_FILE"
echo 'user = nginx' >> "$PHP_ENV_FILE"
echo 'group = www-data' >> "$PHP_ENV_FILE"
env | grep -e 'REPORT_DB_HOST' -e 'REPORT_DB_PORT' -e 'REPORT_DB_NAME' -e 'REPORT_DB_USER' -e 'REPORT_DB_PASS' | sed "s/\(.*\)=\(.*\)/env[\1] = '\2'/" >> "$PHP_ENV_FILE"

# compat from older image where variable was not existing
grep -e ^REPORT_DB_PORT "$PHP_ENV_FILE" || echo env[REPORT_DB_PORT] = 3306 >> "$PHP_ENV_FILE"

# Start supervisord and services
/usr/bin/supervisord -n -c /etc/supervisord.conf
