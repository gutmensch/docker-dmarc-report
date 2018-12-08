FROM boxedcode/alpine-nginx-php-fpm:v1.7.2

MAINTAINER Robert Schumann <gutmensch@n-os.org>

ENV REPORT_PARSER_SOURCE="https://github.com/techsneeze/dmarcts-report-parser/archive/master.zip" \
    REPORT_VIEWER_SOURCE="https://github.com/techsneeze/dmarcts-report-viewer/archive/master.zip"

COPY ./manifest/ /

RUN set -x \
      && apk update \
      && apk add expat-dev mariadb-dev \
      && wget -q --no-check-certificate -O parser.zip $REPORT_PARSER_SOURCE \
      && wget -q --no-check-certificate -O viewer.zip $REPORT_VIEWER_SOURCE \
      && unzip parser.zip && cp -v dmarcts-report-parser-master/* /usr/bin/ && rm -f parser.zip \
      && unzip viewer.zip && cp -v dmarcts-report-viewer-master/* /var/www/viewer/ && rm -f viewer.zip \
      && sed -i "1s/^/body { font-family: Sans-Serif; }\n/" /var/www/viewer/default.css \
      && (echo y;echo o conf prerequisites_policy follow;echo o conf commit)|cpan \
      && for i in \
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
        IO::Socket::SSL \
        ; do cpan install $i; done \
      && apk del mariadb-dev expat-dev \
      && apk add mariadb-client-libs \
      && sed -i 's%.*root /var/www/html;%        root /var/www/viewer;%g' /etc/nginx/conf.d/default.conf \
      && sed -i 's/.*index index.php index.html index.htm;/        index dmarcts-report-viewer.php;/g' /etc/nginx/conf.d/default.conf \
      && chmod 755 /entrypoint.sh

EXPOSE 443 80

CMD ["/bin/bash", "/entrypoint.sh"]
