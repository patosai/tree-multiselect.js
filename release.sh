#!/usr/bin/env bash
set -x
VERSION=$(node -e "console.log(require('./package.json').version);")
grunt release
git add .
git commit -m "Release version $VERSION"
git tag v$VERSION
git push && git push --tags

echo "Updated git and git tags to $VERSION"

npm publish

echo "Updated npm package"

