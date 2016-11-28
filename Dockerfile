FROM ubuntu:14.04

MAINTAINER Robert Schumann <gutmensch@n-os.org>

ENV wget_opts "-q"
ENV raumserver_release http://bassmaniacs.com/data/appBinaries/raumserver/currentVersion
ENV raumserver_libs https://github.com/ChriD/Raumserver/raw/master/source/RaumserverDaemon/libs/linux_X64

WORKDIR /root

RUN set -x \
      && apt-get update \
      && apt-get install -y --no-install-recommends git wget unzip \
      && rm -rf /var/lib/apt/lists/*

RUN set -x \
      && wget $wget_opts $raumserver_release/raumserverDaemon_linux_X64.zip \
      && unzip raumserverDaemon_linux_X64.zip -d raumserver \
      && mkdir -p /etc/raumfeld/raumserverDaemon \
      && ln -s /root/raumserver/docroot /etc/raumfeld/raumserverDaemon/docroot \
      && wget $wget_opts $raumserver_libs/libunwind-x86_64.so.8.0.1 -O /usr/lib/libunwind-x86_64.so.8.0.1 \
      && ln -s /usr/lib/libunwind-x86_64.so.8.0.1 /usr/lib/libunwind-x86_64.so.8 \
      && wget $wget_opts $raumserver_libs/libunwind.so.8.0.1 -O /usr/lib/libunwind.so.8.0.1 \
      && ln -s /usr/lib/libunwind.so.8.0.1 /usr/lib/libunwind.so.8 \
      && wget $wget_opts $raumserver_libs/libunwind-coredump.so.0.0.0 -O /usr/lib/libunwind-coredump.so.0.0.0 \
      && ln -s /usr/lib/libunwind-coredump.so.0 /usr/lib/libunwind-coredump.so.0 \
      && wget $wget_opts $raumserver_libs/libunwind-setjmp.so.0.0.0 -O /usr/lib/libunwind-setjmp.so.0.0.0 \
      && ln -s /usr/lib/libunwind-setjmp.so.0 /usr/lib/libunwind-setjmp.so.0 \
      && wget $wget_opts $raumserver_libs/libunwind-ptrace.so.0.0.0 -O /usr/lib/libunwind-ptrace.so.0.0.0 \
      && ln -s /usr/lib/libunwind-ptrace.so.0 /usr/lib/libunwind-ptrace.so.0
      
EXPOSE 8080

CMD ["/root/raumserver/raumsrvDaemon"]

