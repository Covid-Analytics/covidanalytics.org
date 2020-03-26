#!/bin/bash

while /bin/true; do
  git pull
  ./build-all-notebooks.sh
  sleep 2m;
done
