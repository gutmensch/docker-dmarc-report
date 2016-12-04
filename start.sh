#!/bin/sh

# periodically check if daemon is running
# if not:
#   1. kill former tail processes
#   2. start daemon and wait 5 seconds for startup of logging
#   3. tail new logfile
while true; do
  pgrep raumsrvDaemon 1>/dev/null 2>&1 || {
    echo "$(date "+%Y.%m.%d %H:%M:%S.000") Process missing in action. Starting or restarting raumsrvDaemon.";
    pkill tail 2>/dev/null;
    /opt/raumserver/raumsrvDaemon && sleep 5;
    new_log=$(ls -t /opt/raumserver/logs/*.log 2>/dev/null | head -n 1);
    [ -n "${new_log}" ] && tail -f $new_log &
  }
  sleep 5
done
