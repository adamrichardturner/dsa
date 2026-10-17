upstream dsa_api {
    server 127.0.0.1:4002;
    keepalive 32;
}

server {
    server_name api.datastructuresandalgorithms.com;

    access_log /var/log/nginx/dsa-api.access.log;
    error_log /var/log/nginx/dsa-api.error.log;

    location /healthz {
        add_header Content-Type text/plain;
        return 200 'ok';
    }

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";

        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        proxy_connect_timeout 5s;

        proxy_pass http://dsa_api;
    }

    client_max_body_size 10m;

    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/api.datastructuresandalgorithms.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.datastructuresandalgorithms.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}


server {
    if ($host = api.datastructuresandalgorithms.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    listen [::]:80;
    server_name api.datastructuresandalgorithms.com;
    return 404; # managed by Certbot


}
