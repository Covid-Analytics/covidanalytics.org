Using a Docker container to encapsulate the "static building" of notebooks into HMTL files.

The command we'll run need to have the full repo as build context, so we'll converge to something like:

  ```docker build ../../ -f Dockerfile --tag=covana-backend-compiler```

To test the container:

  ```docker run --rm -it covana-backend-compiler /bin/bash```
