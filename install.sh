#!/bin/bash

app_folder=`pwd`

echo "Install node modules in client"
cd $app_folder/client
npm install

echo "Install bower components"
cd $app_folder/client
bower install

echo "Generate dist"
cd $app_folder/client
grunt

echo "Install node modules in server"
cd  $app_folder/server-app
npm install

echo "Init database"
cd $app_folder/server-app/seeds
node seed.js
cd $app_folder
