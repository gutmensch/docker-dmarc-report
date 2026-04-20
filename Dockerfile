ARG UPSTREAM_IMAGE=trafex/php-nginx:3.9.0
FROM ${UPSTREAM_IMAGE}

LABEL maintainer="Robert Schumann <rs@n-os.org>"

ENV REPORT_PARSER_SOURCE="https://github.com/techsneeze/dmarcts-report-parser/archive/master.zip" \
    REPORT_VIEWER_SOURCE="https://github.com/techsneeze/dmarcts-report-viewer/archive/master.zip" \
    PERL_MM_USE_DEFAULT=1 \
    MAKEFLAGS="-j$(nproc)"

USER root
WORKDIR /

# Bring in entrypoint.sh and other manifests
# Entrypoint
COPY manifest/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# DMARC cron job
COPY manifest/etc/cron.d/root /etc/cron.d/root
RUN chmod 0644 /etc/cron.d/root

# DMARC parser configuration
COPY manifest/usr/bin/dmarcts-report-parser.conf /usr/bin/dmarcts-report-parser.conf
RUN chmod 0644 /usr/bin/dmarcts-report-parser.conf

# DMARC report viewer configuration
COPY manifest/var/www/viewer/dmarcts-report-viewer-config.php \
     /var/www/viewer/dmarcts-report-viewer-config.php
RUN chmod 0644 /var/www/viewer/dmarcts-report-viewer-config.php

RUN sed -i \
  -e 's|files = /etc/supervisor.d/\*.ini|files = /etc/supervisor/conf.d/*.conf|' \
  /etc/supervisord.conf

RUN set -eux \
    && apk update \
    && apk add --no-cache \
        bash \
        cmake \
        expat-dev \
        g++ \
        gpg \
        gzip \
        libpq \
        libpq-dev \
        make \
        mariadb-client \
        mariadb-connector-c \
        mariadb-dev \
        musl-obstack \
        musl-obstack-dev \
        openssl \
        openssl-dev \
        perl \
        perl-dev \
        perl-utils \
        perl-net-ssleay \
        perl-io-socket-ssl \
        perl-xml-parser \
        perl-xml-simple \
        perl-app-cpanminus \
        php84-pdo \
        php84-pdo_mysql \
        php84-pdo_pgsql \
        tzdata \
        wget \
        unzip \
    \
    # --- Fetch DMARC tools ---
    && wget -4 -q --no-check-certificate -O parser.zip "${REPORT_PARSER_SOURCE}" \
    && wget -4 -q --no-check-certificate -O viewer.zip "${REPORT_VIEWER_SOURCE}" \
    \
    && unzip parser.zip \
    && cp -av dmarcts-report-parser-master/* /usr/bin/ \
    && rm -rf parser.zip dmarcts-report-parser-master \
    \
    && unzip viewer.zip \
    && mkdir -p /var/www/viewer \
    && cp -av dmarcts-report-viewer-master/* /var/www/viewer/ \
    && rm -rf viewer.zip dmarcts-report-viewer-master \
    \
    # --- CPAN installs (fast: cpanm, no tests, parallel make) ---
    && cpanm --notest \
        IO::Socket::SSL \
        CPAN::DistnameInfo \
        File::MimeInfo \
        IO::Compress::Gzip \
        Getopt::Long \
        Mail::IMAPClient \
        Mail::Mbox::MessageParser \
        MIME::Base64 \
        MIME::Words \
        MIME::Parser \
        MIME::Parser::Filer \
        XML::Parser \
        XML::Simple \
        DBI \
        DVEEDEN/DBD-mysql-4.052.tar.gz \
        DBD::Pg \
        Socket \
        Socket6 \
        PerlIO::gzip \
    \
    # --- Cleanup build-only deps ---
    && apk del \
        mariadb-dev \
        openssl-dev \
        perl-dev \
        g++ \
        cmake \
        make \
        musl-obstack-dev \
        libpq-dev \
    && rm -rf /root/.cpan /root/.cpanm /tmp/*

# Fix php-fpm command for TrafeX (use versioned binary + allow root)
RUN set -eux; \
  PHP_FPM_BIN="$(ls /usr/sbin/php-fpm* | head -n 1)"; \
  sed -i \
    "s|^command=.*php-fpm.*|command=${PHP_FPM_BIN} -F -R|" \
    /etc/supervisor/conf.d/supervisord.conf

# Enable cron via Supervisor
RUN cat > /etc/supervisor/conf.d/cron.conf <<'EOF'
[program:cron]
command=/usr/sbin/crond -f -l 8
autostart=true
autorestart=true
priority=10
stdout_logfile=/dev/stdout
stderr_logfile=/dev/stderr
EOF

HEALTHCHECK --interval=1m --timeout=3s \
  CMD curl --silent --fail http://127.0.0.1:8080/fpm-ping

EXPOSE 8080

# IMPORTANT: keep TrafeX entrypoint
CMD ["/bin/bash", "/entrypoint.sh"]
