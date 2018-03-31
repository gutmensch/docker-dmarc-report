FROM boxedcode/alpine-nginx-php-fpm:latest

MAINTAINER Robert Schumann <gutmensch@n-os.org>

ENV REPORT_PARSER_SOURCE="https://github.com/techsneeze/dmarcts-report-parser/archive/master.zip" \
    REPORT_VIEWER_SOURCE="https://github.com/techsneeze/dmarcts-report-viewer/archive/master.zip"

COPY ./manifest/ /

RUN set -x \
      && wget -q --no-check-certificate -O parser.zip $REPORT_PARSER_SOURCE \
      && wget -q --no-check-certificate -O viewer.zip $REPORT_VIEWER_SOURCE \
      && unzip parser.zip && mv dmarcts-report-parser-master/* /usr/bin/ && rm -f parser.zip \
      && mv /usr/bin/dmarcts-report-parser.conf.sample /usr/bin/dmarcts-report-parser.conf \
      && unzip viewer.zip && mv dmarcts-report-viewer-master/* /var/www/html/ && rm -f viewer.zip \
      && mv /var/www/html/dmarcts-report-viewer-config.php.sample /var/www/html/dmarcts-report-viewer-config.php \
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
        XML::Simple \
        DBI \
	Socket \
	Socket6 \
        PerlIO::gzip \
        IO::Socket::SSL \
        ; do cpan install $i; done \
      && sed -i 's/.*index index.php index.html index.htm;/index dmarcts-report-viewer.php;/g' /etc/nginx/conf.d/default.conf \
      && chmod 755 /entrypoint.sh

EXPOSE 443 80

CMD ["/bin/bash", "/entrypoint.sh"]

