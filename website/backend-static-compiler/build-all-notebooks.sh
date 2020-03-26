#!/bin/bash

# change this to specify where this application will be served from
# it not in a parameter yet for risk management
INSTALL_DIR="/srv/org.covidanalytics/static"

# build the container to statically compiler, and compile the notebooks to html
docker build . -f Dockerfile --tag=covana-backend-compiler

# compile each notebook by allocating and running a compiler container
for Notebook in ../../analysis/*.ipynb; do
  echo "Creating container to compiler $Notebok..."
  Compiler=`docker run -d --rm -t covana-backend-compiler:latest /bin/bash`
  docker cp "$Notebook" $Compiler:/app/notebook.ipynb
  docker exec $Compiler /app/convert-notebook.sh
  #docker exec -it $Compiler /bin/bash
  docker cp $Compiler:/app/notebook.html "$INSTALL_DIR/index.html"
  docker kill $Compiler > /dev/null
done
