#!/bin/sh
set -x
VERSION=$(node -e "console.log(require('./package.json').version);")
git add .
git commit -m "Release version $VERSION"
git tag v$VERSION
git push --follow-tags

echo "Updated git and git tags to $VERSION"

npm publish

echo "Updated npm package"

