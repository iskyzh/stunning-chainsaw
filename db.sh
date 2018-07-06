#!/usr/bin/env bash

docker run -p 27017:27017 -v ~/Work/ctp-history/db:/data/db mongo
