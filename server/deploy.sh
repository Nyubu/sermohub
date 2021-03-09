#!/bin/bash

echo What should the version be?
read VERSION

docker build -t nyubu/lireddit:$VERSION
docker push nyubu/lireddit:VERSION