FROM python:3.7-buster

# place ourselves in /app
RUN mkdir -p /app /app/output
WORKDIR /app

# install the dependencies
COPY ./app/requirements.txt .
RUN pip install -r requirements.txt

# copy the conversion program
COPY ./app/convert-ipynb.py .
