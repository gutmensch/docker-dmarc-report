#!/usr/bin/env bash
set -e

###############################################################################
# Auto-detect installed PHP version
###############################################################################
PHP_VERSION="$(basename /etc/php*)"
PHP_INI="/etc/${PHP_VERSION}/php.ini"
PHP_CONF_DIR="/etc/${PHP_VERSION}/conf.d"
PHP_FPM_DIR="/etc/${PHP_VERSION}/php-fpm.d"

###############################################################################
# Configure PHP error display
###############################################################################
if [[ "${ERRORS:-}" != "1" ]]; then
  sed -i 's|^error_reporting =.*|error_reporting = E_ALL|' "$PHP_INI"
  sed -i 's|^display_errors =.*|display_errors = stdout|' "$PHP_INI"
fi

###############################################################################
# Disable OPCache if requested
###############################################################################
if [[ -n "${NO_OPCACHE:-}" ]]; then
  sed -i 's|^zend_extension=opcache.so|;zend_extension=opcache.so|' \
    "${PHP_CONF_DIR}/00_opcache.ini" || true
fi

###############################################################################
# Tune nginx workers
###############################################################################
procs=$(grep -c ^processor /proc/cpuinfo 2>/dev/null || echo 1)
sed -i "s|worker_processes .*;|worker_processes ${procs};|" \
  /etc/nginx/nginx.conf

###############################################################################
# PHP-FPM pool user override
###############################################################################
mkdir -p "$PHP_FPM_DIR"

cat > "${PHP_FPM_DIR}/zz-user.conf" <<'EOF'
[www]
user = nginx
group = www-data
clear_env = no
EOF

###############################################################################
# Fix PHP-FPM socket permissions so nginx can connect
###############################################################################
PHP_FPM_POOL="$(ls /etc/php*/php-fpm.d/www.conf | head -n1)"

sed -i \
  -e 's|^listen = .*|listen = /run/php-fpm.sock|' \
  -e 's|^;\\?listen.owner =.*|listen.owner = nginx|' \
  -e 's|^;\\?listen.group =.*|listen.group = nginx|' \
  -e 's|^;\\?listen.mode =.*|listen.mode = 0660|' \
  "$PHP_FPM_POOL"

# Ensure entries exist even if upstream file lacks them
grep -q '^listen.owner' "$PHP_FPM_POOL" || echo 'listen.owner = nginx' >> "$PHP_FPM_POOL"
grep -q '^listen.group' "$PHP_FPM_POOL" || echo 'listen.group = nginx' >> "$PHP_FPM_POOL"
grep -q '^listen.mode'  "$PHP_FPM_POOL" || echo 'listen.mode = 0660'  >> "$PHP_FPM_POOL"

###############################################################################
# PHP-FPM environment variables
###############################################################################
cat > "${PHP_FPM_DIR}/env.conf" <<'EOF'
[www]
clear_env = no
EOF

env | grep -E \
  'REPORT_DB_TYPE|REPORT_DB_HOST|REPORT_DB_PORT|REPORT_DB_NAME|REPORT_DB_USER|REPORT_DB_PASS' \
  | sed "s|\(.*\)=\(.*\)|env[\1] = '\2'|" >> "${PHP_FPM_DIR}/env.conf"

grep -q '^env\[REPORT_DB_PORT\]' "${PHP_FPM_DIR}/env.conf" \
  || echo "env[REPORT_DB_PORT] = 3306" >> "${PHP_FPM_DIR}/env.conf"

###############################################################################
# Initial DMARC parse
###############################################################################
if /usr/bin/dmarcts-report-parser.pl -i -d -r \
  > /var/log/nginx/dmarc-reports.log 2>&1; then
  echo "INFO: DMARC reports parsed successfully"
else
  echo "CRIT: DMARC parsing failed"
  cat /var/log/nginx/dmarc-reports.log
  exit 1
fi

###############################################################################
# Disable nginx IPv6 listeners globally
###############################################################################
if [[ -n "${NO_NGINX_IPV6:-}" ]]; then
  echo "[entrypoint] NO_NGINX_IPV6 is set — disabling nginx IPv6 listeners"
  find /etc/nginx -type f -name '*.conf' -print0 \
    | xargs -0 sed -i \
      's/^[[:space:]]*listen[[:space:]]\+\[::\]:[0-9]\+.*;/# &/'
fi

###############################################################################
# Fix nginx root and index for DMARC viewer
###############################################################################
# Set correct root and index
sed -i \
  -e 's|root\s\+/var/www/html;|root /var/www/viewer;|' \
  -e 's|index\s\+.*;|index dmarcts-report-viewer.php index.php index.html;|' \
  /etc/nginx/conf.d/default.conf

# Fix try_files so "/" routes to the viewer PHP file
sed -i \
  -e 's|try_files .*;|try_files $uri $uri/ /dmarcts-report-viewer.php?$query_string;|' \
  /etc/nginx/conf.d/default.conf

# Ensure fastcgi_index is valid
sed -i \
  -e 's|fastcgi_index\s\+.*;|fastcgi_index index.php;|' \
  /etc/nginx/conf.d/default.conf

###############################################################################
# Replace TrafeX default nginx server with DMARC viewer front-controller
###############################################################################
# Detect PHP-FPM socket dynamically
PHP_FPM_SOCK="$(grep -R 'listen =' /etc/php*/php-fpm.d/www.conf | sed 's/.*listen = //')"

# Define nginx DMARC server
cat > /etc/nginx/conf.d/dmarc.conf <<EOF
server {
    listen 8080;
    server_name _;

    root /var/www/viewer;
    index dmarcts-report-viewer.php index.php index.html;

    location / {
        try_files \$uri \$uri/ /dmarcts-report-viewer.php?\$query_string;
    }

    location ~ \.php\$ {
        try_files \$uri =404;
        include fastcgi_params;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        fastcgi_pass unix:${PHP_FPM_SOCK};
    }
}
EOF

# Disable the default TrafeX server
rm -f /etc/nginx/conf.d/default.conf

###############################################################################
# Start supervisor
###############################################################################
exec /usr/bin/supervisord -n -c /etc/supervisord.conf
