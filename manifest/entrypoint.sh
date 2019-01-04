# Display PHP error's or not
if [[ "$ERRORS" != "1" ]] ; then
  sed -i -e "s/error_reporting =.*=/error_reporting = E_ALL/g" /usr/etc/php.ini
  sed -i -e "s/display_errors =.*/display_errors = stdout/g" /usr/etc/php.ini
fi

# Disable opcache?
if [[ -v NO_OPCACHE ]]; then
    sed -i -e "s/zend_extension=opcache.so/;zend_extension=opcache.so/g" /etc/php.d/zend-opcache.ini
fi

# Tweak nginx to match the workers to cpu's
procs=$(cat /proc/cpuinfo | grep processor | wc -l)
sed -i -e "s/worker_processes 5/worker_processes $procs/" /etc/nginx/nginx.conf

# Copy important env vars for PHP-FPM to access
PHP_ENV_FILE="/usr/etc/php-fpm.d/${PHP_ENV_FILE:-env.conf}"
echo '[www]' > "$PHP_ENV_FILE"
env | grep -e 'REPORT_DB_HOST' -e 'REPORT_DB_NAME' -e 'REPORT_DB_USER' -e 'REPORT_DB_PASS' | sed "s/\(.*\)=\(.*\)/env[\1]='\2'/" >> "$PHP_ENV_FILE"

# Start supervisord and services
/usr/bin/supervisord -n -c /etc/supervisord.conf
