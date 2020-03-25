#!/bin/bash

# change this to specify where this application will be served from
# it not in a parameter yet for risk management
INSTALL_DIR="/srv/org.covidanalytics/static"

# build the container to statically compiler, and compile the notebooks to html
docker build ../../ -f Dockerfile --tag=covana-backend-compiler

# compile each notebook by allocating and running a compiler container
for Notebook in ../../analysis/*.ipynb; do
  echo "Creating container to compiler $Notebok..."
  Compiler=`docker run -d --rm -t covana-backend-compiler:latest /bin/bash`
  echo " > copying over the notebook"
  docker cp "$Notebook" $Compiler:/app/notebook.ipynb
  echo " > compiling it"
  docker exec $Compiler jupyter-nbconvert --to html --template full --execute /app/notebook.ipynb
  echo " > getting the result back"
  docker cp $Compiler:/app/notebook.html "$INSTALL_DIR/index.html"
  echo " > killing the compiler container."
  docker kill $Compiler > /dev/null
done
