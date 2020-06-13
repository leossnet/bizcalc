#!/bin/bash

if ! [ -d /htdocs ]; then
    mkdir /htdocs
fi
cd /htdocs/

git clone https://github.com/leossnet/bizcalc.git

#nginx
#конфиг bizcalc.conf предполагает наличие ssl-сертификатов для сайта bizcalc.ru в папке /etc/nginx/ssl
#если таких сертификатов нет, то их нужно там разместить до запуска скрипта установки.
sudo apt install -y nginx
sudo cp /htdocs/bizcalc/install/bizcalc.conf /etc/nginx/sites-available/bizcalc.conf
sudo ln -s /etc/nginx/sites-available/bizcalc.conf /etc/nginx/sites-enabled/bizcalc.conf
sudo rm -rf /etc/nginx/sites-enabled/default
sudo service nginx restart
