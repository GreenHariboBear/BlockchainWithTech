#!/bin/bash
cd /tmp;
rm -r keyValStore/;
docker stop $(docker ps -a -q);
docker rm -f $(docker ps -aq);
cd ~/fabric-images/docker-compose/;
. setenv.sh;
docker-compose -f single-peer-ca.yaml up;