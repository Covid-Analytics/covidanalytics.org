#!/bin/bash

while /bin/true; do
  echo "[$(date)] Running"
  git pull
  echo
  ./build-website.sh
  sleep 2m;
  echo
done
