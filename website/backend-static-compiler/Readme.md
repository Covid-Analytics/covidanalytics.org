Using a Docker container to encapsulate the "static building" of notebooks into HMTL files.

The command we'll run need to have the full repo as build context, so we'll converge to something like:

  ```docker build ../../ -f Dockerfile --tag=covana-backend-compiler```

To test the container:

  ```docker run --rm -it covana-backend-compiler /bin/bash```

## Continuous update of the Analses
Use this simple script that operates ever 2 minutes and:
* pulls the latest repo from github
* compiles the notebooks to html
* (not done yet) updates the frontend - for now it only replaces /index.html with the last notebook

Run ```continuous-update-loop.sh``` on a ```tmux``` instance.
