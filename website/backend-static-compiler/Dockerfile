FROM python:3.7-buster

RUN apt-get update && apt-get -yq install --no-install-recommends \
    ca-certificates

# No need for these packages as we use the 'requirements.txt' system
#RUN apt-get -yq install jupyter-nbconvert jupyter \
#     python3-matplotlib python3-numpy python3-pandas

# place ourselves in /app
RUN mkdir /app
WORKDIR /app

# install the dependencies
COPY ./app/requirements.txt /app/
RUN pip install -r requirements.txt

# copy the conversion program
COPY ./app/convert-ipynb.py /app/
