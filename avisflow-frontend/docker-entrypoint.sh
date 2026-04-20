#!/bin/sh
# If SSL certs exist, include the SSL nginx config
if [ -f /etc/letsencrypt/live/avisflow.online/fullchain.pem ]; then
    echo "SSL certificates found — enabling HTTPS"
    cp /etc/nginx/ssl.conf /etc/nginx/conf.d/ssl.conf
fi
# Start nginx
exec nginx -g 'daemon off;'
