set -e

./node_modules/.bin/prettier --write "$1"

./node_modules/sanctuary-prettier/sanctuary-prettier.js "$1"