#!/bin/bash

# change this to specify where this application will be served from
# it not in a parameter yet for risk management
INSTALL_DIR="/srv/org.covidanalytics/static"

# build the container to statically compile the notebooks to html
echo "Building or refreshing the Docker container for compiling notebooks to HTML"
docker build . -f Dockerfile --tag=covana-compiler
echo

# Perform the conversion via docker
echo "[$(date)] Running"
Compiler=$(docker run --rm -d -t covana-compiler:latest /bin/bash)
echo "> Copying notebooks from '../../../analysis' to the container 'input/' folder"
for Notebook in ../../analysis/*.ipynb; do docker cp "$Notebook" "$Compiler":/app/input/; done
echo "> Compiling..."
docker exec -t "$Compiler" python3 /app/convert-ipynb.py
#docker exec -it $Compiler /bin/bash
docker cp "$Compiler":/app/output .
echo "> Removing container..."
docker kill "$Compiler" > /dev/null
echo "...done."

# Install the new contents
cp -a output/* "$INSTALL_DIR"
touch "$INSTALL_DIR/custom.css"
# TEMP: link to the index
ln -nsf "covid19_world/index.html" "$INSTALL_DIR/index.html"
