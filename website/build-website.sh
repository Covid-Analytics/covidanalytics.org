#!/bin/bash

# change this to specify where this application will be served from
# it not in a parameter yet for risk management
INSTALL_DIR="/srv/org.covidanalytics/static"
LOCAL_CONVERTER_OUTPUT="out_converter"
LOCAL_FRONTEND_OUTPUT="out_frontend"

# == CONVERTER ==

# build the container to statically compile the notebooks to html
docker build . -f Dockerfile.converter --tag=covana-converter

# perform the conversion (instanciate the container, copy files, excute script, copy back output) - 1 minute
# NOTE: to inspect the image at any state: docker exec -it $CONV_CONTAINER /bin/bash
echo "> Start Notebooks Converter container"
CONV_CONTAINER=$(docker run --rm -d -t covana-converter:latest /bin/bash)

echo "> Copying notebooks from '../../../analysis' to the container 'input/' folder"
for NOTEBOOK in ../analysis/*.ipynb; do docker cp "$NOTEBOOK" "$CONV_CONTAINER":/app/input/; done

echo "> Converting Notebooks (and copying the output to $LOCAL_CONVERTER_OUTPUT)..."
time docker exec -t "$CONV_CONTAINER" python3 /app/convert-ipynb.py
docker cp "$CONV_CONTAINER":/app/output/ "$LOCAL_CONVERTER_OUTPUT"

echo "> Removing container..."
docker kill "$CONV_CONTAINER" > /dev/null
echo "...done."

# == Frontend ==

# build the container
docker build . -f Dockerfile.frontend --tag=covana-frontend

# perform the frontend compilation - 2 minutes
echo "> Start Frontend compiler container"
FRONTEND_CONTAINER=$(docker run --rm -d -t covana-frontend:latest /bin/bash)

echo "> Copying GLUE files (site already in the image)..."
docker cp "$LOCAL_CONVERTER_OUTPUT/." "$FRONTEND_CONTAINER":/app/public/
#docker exec -t "$FRONTEND_CONTAINER" mv /app/public/... /app/...

echo "> Compiling Frontend (and copying the output to $LOCAL_FRONTEND_OUTPUT)..."
time docker exec -t "$FRONTEND_CONTAINER" npm run build
docker cp "$FRONTEND_CONTAINER":/app/build/ "$LOCAL_FRONTEND_OUTPUT"

echo "> Removing container..."
docker kill "$FRONTEND_CONTAINER" > /dev/null
echo "...done."


# Install the new contents
cp -a "$LOCAL_FRONTEND_OUTPUT"/* "$INSTALL_DIR"
# TEMP: link to the index
#ln -nsf "covid19_world/index.html" "$INSTALL_DIR/index.html"
