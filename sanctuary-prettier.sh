set -e
node_modules/.bin/prettier --write "$1"
sanctuary-prettier "$1"
