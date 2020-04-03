#!/bin/bash

# change this to specify where this application will be served from
# it not in a parameter yet for risk management
INSTALL_DIR="/srv/org.covidanalytics/static"
LOCAL_CONVERTER_OUTPUT="out_converter"
LOCAL_CONVERTER_LOG="$LOCAL_FRONTEND_OUTPUT"/coverter.out.html
LOCAL_FRONTEND_OUTPUT="out_frontend"

# == CONVERTER ==

# build the container to statically compile the notebooks to html
docker build . -f Dockerfile.converter --tag=covana-converter

# perform the conversion (instanciate the container, copy files, excute script, copy back output) - 1 minute
# NOTE: to inspect the image at any state: docker exec -it $CONV_CONTAINER /bin/bash
echo "> Start Notebooks Converter container"
CONV_CONTAINER=$(docker run --rm -d -t covana-converter:latest /bin/bash)

echo "> Copying notebooks from '../analysis' to the container 'input/' folder"
for NOTEBOOK in ../analysis/*.ipynb; do docker cp "$NOTEBOOK" "$CONV_CONTAINER":/app/input/; done

echo "> Converting Notebooks (and copying the output to $LOCAL_CONVERTER_OUTPUT)..."
rm -fr "$LOCAL_CONVERTER_OUTPUT"
mkdir -p "$LOCAL_CONVERTER_OUTPUT"
echo "<html><body><pre>" >> "$LOCAL_CONVERTER_LOG"
time docker exec -t "$CONV_CONTAINER" python3 /app/convert-ipynb.py |& tee "$LOCAL_CONVERTER_LOG"
docker cp "$CONV_CONTAINER":/app/output/. "$LOCAL_CONVERTER_OUTPUT"
echo "</pre></body></html>" >> "$LOCAL_CONVERTER_LOG"

echo -n "> Removing container... "
docker kill "$CONV_CONTAINER" > /dev/null
echo "done."

# == Frontend ==

# build the container
docker build . -f Dockerfile.frontend --tag=covana-frontend

# perform the frontend compilation - 2 minutes
echo "> Start Frontend compiler container"
FRONTEND_CONTAINER=$(docker run --rm -d -t covana-frontend:latest /bin/bash)

echo "> Copying GLUE files (site already in the image)..."
# copy to the public wesbite, for serving the Notebook folders (index.html + pictures)
docker cp "$LOCAL_CONVERTER_OUTPUT/." "$FRONTEND_CONTAINER":/app/public/
# copy to the data folder, for glueing up with the Frontend (by replacing this single file)
docker cp "$LOCAL_CONVERTER_OUTPUT/DataGlue.js" "$FRONTEND_CONTAINER":/app/src/data/

echo "> Compiling Frontend (and copying the output to $LOCAL_FRONTEND_OUTPUT)..."
rm -fr "$LOCAL_FRONTEND_OUTPUT"
time docker exec -t "$FRONTEND_CONTAINER" npm run build
docker cp "$FRONTEND_CONTAINER":/app/build/. "$LOCAL_FRONTEND_OUTPUT"

echo -n "> Removing container... "
docker kill "$FRONTEND_CONTAINER" > /dev/null
echo "done."

# Install the new contents
rm -fr "$INSTALL_DIR"/precache* "$INSTALL_DIR"/static/
cp -a "$LOCAL_FRONTEND_OUTPUT"/* "$INSTALL_DIR"
rm -f "$INSTALL_DIR"/DataGlue.js "$INSTALL_DIR"/service-worker.js


# == Cleanup ==
echo -n "> Cleaning up docker images... "
# shellcheck disable=SC2046
docker rmi $(docker image ls -f dangling=true -q) 2> /dev/null
echo "done."
echo
