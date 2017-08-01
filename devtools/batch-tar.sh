#!/bin/bash
cd ../dist
ls -F | grep '/$' | awk -F '/' '{print $1".tar.gz"}''{print $1"/"}' | xargs -n2 tar zcvf