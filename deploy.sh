#!/bin/bash

echo ">>> Adding all changes..."
git add -A

echo ">>> Committing..."
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "Nothing new to commit."

echo ">>> Pushing to GitHub..."
git push origin master

echo ">>> Done! Vercel will auto-redeploy shortly."
