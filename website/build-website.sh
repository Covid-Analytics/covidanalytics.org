#!/bin/bash

# change this to specify where this application will be served from
# it not in a parameter yet for risk management
INSTALL_DIR="/srv/org.covidanalytics/static"
LOCAL_CONVERTER_OUTPUT="out_converter"
LOCAL_FRONTEND_OUTPUT="out_frontend"

# == CONVERTER ==

# build the container to statically compile the notebooks to html
docker build . -f Dockerfile.converter --tag=covana-converter

# perform the conversion (instanciate the container, copy files, excute script, copy back output)
# NOTE: to inspect the image at any state: docker exec -it $CONVERTER_PROCESS /bin/bash
CONVERTER_PROCESS=$(docker run --rm -d -t covana-converter:latest /bin/bash)
echo "> Copying notebooks from '../../../analysis' to the container 'input/' folder"
for NOTEBOOK in ../analysis/*.ipynb; do docker cp "$NOTEBOOK" "$CONVERTER_PROCESS":/app/input/; done
echo "> Converting Notebooks (and copying the output to $LOCAL_CONVERTER_OUTPUT)..."
docker exec -t "$CONVERTER_PROCESS" python3 /app/convert-ipynb.py
docker cp "$CONVERTER_PROCESS":/app/output/ "$LOCAL_CONVERTER_OUTPUT"
echo "> Removing container..."
docker kill "$CONVERTER_PROCESS" > /dev/null
echo "...done."

# == Frontend ==

# TODO: MISSING GLUE HERE?

# build the container
docker build . -f Dockerfile.frontend --tag=covana-frontend
FRONTEND_PROCESS=$(docker run --rm -d -t covana-frontend:latest /bin/bash)
echo "> Copying site files..."
docker cp frontend/. "$FRONTEND_PROCESS":/app/
echo "> Compiling Frontend (and copying the output to $LOCAL_FRONTEND_OUTPUT)..."
docker exec -t "$FRONTEND_PROCESS" npm run build
docker cp "$FRONTEND_PROCESS":/app/build/ "$LOCAL_FRONTEND_OUTPUT"
echo "> Removing container..."
docker kill "$FRONTEND_PROCESS" > /dev/null
echo "...done."


# Install the new contents
cp -a "$LOCAL_CONVERTER_OUTPUT"/* "$INSTALL_DIR"
# TEMP: link to the index
touch "$INSTALL_DIR/custom.css"
ln -nsf "covid19_world/index.html" "$INSTALL_DIR/index.html"
