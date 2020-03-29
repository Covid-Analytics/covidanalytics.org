#!/bin/bash

while /bin/true; do
  echo "[$(date)] Running"
  git pull
  ./build-website.sh
  sleep 2m;
done
