# videos

## Features

### Supporting Media Formats
- .ts
- .m2ts
- .mp4
- .webm

### Upload Size
See a .env and edit.

## References
- [FFmpeg](https://github.com/FFmpeg/FFmpeg)
- [mpegts.js](https://github.com/xqq/mpegts.js)

### FFmpeg
Version: 5.0.1

### mpegts.js
Using [Fork and Build](https://github.com/iamtakagi/mpegts.js).

## Get Started
```console
$ docker-compose up -d
```

### docker-compose.yml (example)
```yml
version: '3.8'
services:
  app:
    container_name: videos
    image: videos:latest
    build: 
      context: .
      dockerfile: Dockerfile
    volumes:
      - ./storage:/app/storage:rw
      - ./thumbnail:/app/thumbnail:rw
    env_file:
      - .env
    environment:
      - TZ=Asia/Tokyo
      - LANG=ja_JP.UTF-8
      - PORT=8777
    restart: unless-stopped
    networks:
      - proxy_network
networks:
  proxy_network:
    external: true
```

### .env
```env
ADMIN_USER=hoge
ADMIN_PASS=foo
UPLOAD_LIMIT_MB=1000
SITE_BASEURL=https://foo.com
```

### Run Development Server
```console
$ yarn dev
```

### Build
Bundle webpack and Copy built mpegts.js
```console
$ yarn build
```

### Start as Production Mode
```console
$ node app.js
```

## LICENSE
MIT License.