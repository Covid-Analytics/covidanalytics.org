#!/bin/bash

while /bin/true; do
  git pull
  ./build-website.sh
  sleep 2m;
done
