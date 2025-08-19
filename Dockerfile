FROM nginx:stable-alpine
COPY /example-smart-app /usr/share/nginx/html
COPY  ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 80