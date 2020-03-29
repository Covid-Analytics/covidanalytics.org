#!/bin/bash

# change this to specify where this application will be served from
# it not in a parameter yet for risk management
INSTALL_DIR="/srv/org.covidanalytics/static"
LOCAL_OUTPUT_DIR="converter_output"

# build the container to statically compile the notebooks to html
echo "Building or refreshing the Docker container for compiling notebooks to HTML"
docker build . -f Dockerfile --tag=covana-converter
echo

# Perform the conversion via docker
echo "[$(date)] Running"
CONVERTER_PROCESS=$(docker run --rm -d -t covana-converter:latest /bin/bash)
echo "> Copying notebooks from '../../../analysis' to the container 'input/' folder"
for NOTEBOOK in ../analysis/*.ipynb; do docker cp "$NOTEBOOK" "$CONVERTER_PROCESS":/app/input/; done
echo "> Compiling..."
docker exec -t "$CONVERTER_PROCESS" python3 /app/convert-ipynb.py
docker cp "$CONVERTER_PROCESS":/app/output "$LOCAL_OUTPUT_DIR"
#docker exec -it $CONVERTER_PROCESS /bin/bash
echo "> Removing container..."
docker kill "$CONVERTER_PROCESS" > /dev/null
echo "...done."

# Install the new contents
cp -a "$LOCAL_OUTPUT_DIR"/* "$INSTALL_DIR"
# TEMP: link to the index
touch "$INSTALL_DIR/custom.css"
ln -nsf "covid19_world/index.html" "$INSTALL_DIR/index.html"
