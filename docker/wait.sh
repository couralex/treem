#!/bin/bash

services=("mysql 3306" "postgres 5432")

for service in "${services[@]}"; do
  while ! nc -w1 -z $service; do
    sleep 0.1
  done
done
