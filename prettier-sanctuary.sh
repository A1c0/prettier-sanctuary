set -e
./node_modules/.bin/prettier --write "$1"
node_modules/prettier-sanctuary/prettier-sanctuary.js "$1"
