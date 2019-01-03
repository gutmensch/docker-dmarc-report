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

# Start supervisord and services
/usr/bin/supervisord -n -c /etc/supervisord.conf
