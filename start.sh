#!/bin/sh
ps aux | grep chronograf | fgrep -v grep | awk '{print $2}' | xargs kill
nohup ./chronograf --host 0.0.0.0 --port 8888 -b /var/lib/chronograf/chronograf-v1.db -c /usr/share/chronograf/canned &
