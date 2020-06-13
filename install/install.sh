#!/bin/bash

if ! [ -d /htdocs ]; then
    mkdir /htdocs
fi
cd /htdocs/

git clone https://github.com/leossnet/bizcalc.git
