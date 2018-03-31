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

# Very dirty hack to replace variables in code with ENVIRONMENT values
if [[ -v TEMPLATE_NGINX_HTML ]] ; then
  for i in $(env)
  do
    variable=$(echo "$i" | cut -d'=' -f1)
    value=$(echo "$i" | cut -d'=' -f2)
    if [[ "$variable" != '%s' ]] ; then
      replace='\$\$_'${variable}'_\$\$'
      find /var/www/viewer -type f -exec sed -i -e 's#'${replace}'#'${value}'#g' {} \;
    fi
  done
fi

# Very dirty hack to replace variables in conf with ENVIRONMENT values
if [[ -v TEMPLATE_PERL_CONF ]] ; then
  for i in $(env)
  do
    variable=$(echo "$i" | cut -d'=' -f1)
    value=$(echo "$i" | cut -d'=' -f2)
    if [[ "$variable" != '%s' ]] ; then
      replace='\$\$_'${variable}'_\$\$'
      find /usr/bin -type f -name *.conf -exec sed -i -e 's#'${replace}'#'${value}'#g' {} \;
    fi
  done
fi

if [[ -v PARSER_PROCESS_INTERVAL ]] ; then
  echo "${PARSER_PROCESS_INTERVAL} /usr/bin/dmarcts-report-parser.pl -i -d -r" > /etc/cron.d/root
fi

# Start supervisord and services
/usr/bin/supervisord -n -c /etc/supervisord.conf

