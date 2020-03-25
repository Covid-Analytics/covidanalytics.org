#!/bin/bash

# First manual setup: generation of the SSH keys for the domain.
# The following has been executed manually.
#  certbot certonly --nginx --expand  -d www.covidanalytics.com -d covidanalytics.com

# copy the frontend configuration (note: this requires the SSH certs to be present, as per the above)
SCRIPT_DIR=`dirname "$(readlink -f "$0")"`
ln -nsf "$SCRIPT_DIR/nginx-site-covidanalytics.conf" /etc/nginx/sites-enabled/

# restart nginx
service nginx restart
