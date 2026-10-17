upstream dsa_api {
    server 127.0.0.1:4002;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
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
}
