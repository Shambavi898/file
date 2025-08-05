server {
    listen 80;
    listen [::]:80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()";

    # Cache settings
    location ~* \.(?:css|js|jpg|jpeg|gif|png|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # PWA requirements
    location / {
        try_files $uri $uri/ /index.html;
        add_header Service-Worker-Allowed /;
    }

    # Service worker scope
    location /service-worker.js {
        add_header Cache-Control "no-cache";
        proxy_cache_bypass $http_pragma;
        proxy_cache_revalidate on;
        expires off;
        access_log off;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;
}