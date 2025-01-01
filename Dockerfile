# 构建阶段
FROM node:18 as builder

WORKDIR /app
COPY package*.json ./
# 使用淘宝 npm 镜像
RUN npm config set registry https://registry.npmmirror.com
RUN npm install
RUN npm install plantuml-encoder
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 添加host.docker.internal支持
RUN echo -e '#!/bin/sh\n\
echo "host.docker.internal host-gateway" >> /etc/hosts\n\
nginx -g "daemon off;"' > /docker-entrypoint.sh && \
chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"] 