FROM ubuntu:14.04

MAINTAINER Robert Schumann <gutmensch@n-os.org>

ENV wget_opts "-q --no-check-certificate"
ENV raumserver_release "http://bassmaniacs.com/data/appBinaries/raumserver/currentVersion"
ENV raumserver_libs "https://github.com/ChriD/Raumserver/raw/master/source/RaumserverDaemon/libs/linux_X64"
ENV PATH /opt:$PATH

WORKDIR /opt

COPY start.sh ./start.sh

RUN set -x \
      && apt-get update \
      && apt-get install -y --no-install-recommends wget unzip \
      && rm -rf /var/lib/apt/lists/*

RUN set -x \
      && wget $wget_opts $raumserver_release/raumserverDaemon_linux_X64.zip \
      && unzip raumserverDaemon_linux_X64.zip -d raumserver \
      && rm -f raumserverDaemon_linux_X64.zip \
      && mkdir -p /etc/raumfeld/raumserverDaemon \
      && ln -s /opt/raumserver/docroot /etc/raumfeld/raumserverDaemon/docroot \
      && for l in libunwind-x86_64.so.8.0.1 libunwind.so.8.0.1 libunwind-coredump.so.0.0.0 libunwind-setjmp.so.0.0.0 libunwind-ptrace.so.0.0.0; do \
           wget $wget_opts $raumserver_libs/"$l" -O /usr/lib/"$l" && \
           ln -s /usr/lib/"$l" /usr/lib/"$(echo $l | sed 's%\.[0-9]\.[0-9]$%%')" ; \
         done \
      && chmod +x start.sh

EXPOSE 8080

CMD ["start.sh"]
