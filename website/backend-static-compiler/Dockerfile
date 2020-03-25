FROM python:3.7-buster

RUN apt-get update && apt-get -yq install --no-install-recommends \
    ca-certificates

# Install the nbconvert-specific system packes
RUN apt-get -yq install jupyter-nbconvert

# place ourselves in /app
RUN mkdir /app
WORKDIR /app

COPY analysis/example_one.ipynb /app
