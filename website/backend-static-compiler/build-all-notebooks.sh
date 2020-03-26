#!/bin/bash

# change this to specify where this application will be served from
# it not in a parameter yet for risk management
INSTALL_DIR="/srv/org.covidanalytics/static"

# build the container to statically compile the notebooks to html
echo "Building or refreshing the Docker container for compiling notebooks to HTML"
docker build . -f Dockerfile --tag=covana-backend-compiler 2> /dev/null
echo

# compile each notebook by allocating and running a compiler container
for Notebook in ../../analysis/*.ipynb; do
  echo "[`date`] Using the 'covana-backend-compiler' container to convert: $Notebook"
  Compiler=`docker run -d --rm -t covana-backend-compiler:latest /bin/bash`
  docker cp "$Notebook" $Compiler:/app/notebook.ipynb
  docker exec $Compiler /app/convert-notebook.sh
  #docker exec -it $Compiler /bin/bash
  docker cp $Compiler:/app/notebook.html "$INSTALL_DIR/index.html"
  docker kill $Compiler > /dev/null
  echo "...done"
  echo
done
