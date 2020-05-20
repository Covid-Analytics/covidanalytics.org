#!/bin/bash

while /bin/true; do
  echo "[$(date)] Running - Next update in 2h"
  git pull
  echo
  ./build-website.sh
  sleep 2h;
#  sleep 5m;
  echo
done
