FROM trafex/alpine-nginx-php7:2.0.2

LABEL maintainer="Robert Schumann <gutmensch@n-os.org>"

ENV REPORT_PARSER_SOURCE="https://github.com/techsneeze/dmarcts-report-parser/archive/master.zip" \
    REPORT_VIEWER_SOURCE="https://github.com/techsneeze/dmarcts-report-viewer/archive/master.zip"

USER root

WORKDIR /

COPY ./manifest/ /

RUN set -x \
      && apk update \
      && apk add bash expat-dev mariadb-dev mariadb-client mariadb-connector-c openssl gzip wget perl-utils g++ make perl-dev \
      && wget -4 -q --no-check-certificate -O parser.zip $REPORT_PARSER_SOURCE \
      && wget -4 -q --no-check-certificate -O viewer.zip $REPORT_VIEWER_SOURCE \
      && unzip parser.zip && cp -av dmarcts-report-parser-master/* /usr/bin/ && rm -vf parser.zip && rm -rvf dmarcts-report-parser-master \
      && unzip viewer.zip && cp -av dmarcts-report-viewer-master/* /var/www/viewer/ && rm -vf viewer.zip && rm -rvf dmarcts-report-viewer-master \
      && sed -i "1s/^/body { font-family: Sans-Serif; }\n/" /var/www/viewer/default.css \
      && sed -i 's%.*listen [::]:8080 default_server;%        listen [::]:80 default_server;%g' /etc/nginx/nginx.conf \
      && sed -i 's%.*listen 8080 default_server;%        listen 80 default_server;%g' /etc/nginx/nginx.conf \
      && sed -i 's%.*root /var/www/html;%        root /var/www/viewer;%g' /etc/nginx/nginx.conf \
      && sed -i 's/.*index index.php index.html;/        index dmarcts-report-viewer.php;/g' /etc/nginx/nginx.conf \
      && sed -i 's%files = /etc/supervisor.d/\*.ini%files = /etc/supervisor/conf.d/*.conf%g' /etc/supervisord.conf \
      && chmod 755 /entrypoint.sh \
      && (echo y;echo o conf prerequisites_policy follow;echo o conf commit)|cpan \
      && for i in \
	CPAN \
        CPAN::DistnameInfo \
        IO::Socket::SSL \
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
        DBD::mysql \
	Socket \
	Socket6 \
        PerlIO::gzip \
        ; do cpan install $i; done \
      && apk del mariadb-dev expat-dev perl-dev g++ make

HEALTHCHECK --interval=1m --timeout=3s CMD curl --silent --fail http://127.0.0.1:80/fpm-ping

EXPOSE 80

CMD ["/bin/bash", "/entrypoint.sh"]
