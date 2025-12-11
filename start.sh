#!/bin/sh
set -e

echo "Waiting for database to be ready..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

echo "Running migrations..."
npx prisma migrate deploy

echo "Running seeds..."
npx prisma db seed

echo "Starting application..."
npm run start
