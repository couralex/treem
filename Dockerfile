FROM node:latest

RUN apt-get update
RUN apt-get install -y mysql-client
RUN apt-get install -y postgresql-client
RUN apt-get install -y netcat

WORKDIR /home/project
COPY package.json ./
ENV NPM_CONFIG_LOGLEVEL error
RUN npm install

CMD /bin/bash /home/project/docker/wait.sh && \
  mysql -h mysql -uroot -pcouralex -e "DROP DATABASE IF EXISTS moviedb;CREATE DATABASE moviedb" && \
  mysql -h mysql -uroot -pcouralex moviedb < /home/project/docker/moviedb.mysql.sql && \
  psql --quiet "postgres://couralex:couralex@postgres:5432" -c "DROP DATABASE IF EXISTS moviedb" && \
  psql --quiet "postgres://couralex:couralex@postgres:5432" -c "CREATE DATABASE moviedb" && \
  psql --quiet "postgres://couralex:couralex@postgres:5432/moviedb" -f /home/project/docker/moviedb.pg.sql && \
  npm run test-e2e
