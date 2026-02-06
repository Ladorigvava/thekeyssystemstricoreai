#!/bin/bash

# Heroku Deployment Script for The Keys System
# This script automates the deployment process to Heroku

echo "======================================"
echo "  The Keys System - Heroku Deploy"
echo "======================================"
echo ""

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null
then
    echo "❌ Heroku CLI not found!"
    echo "Please install it from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

echo "✅ Heroku CLI found"
echo ""

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null
then
    echo "🔐 Please login to Heroku..."
    heroku login
else
    echo "✅ Already logged in to Heroku"
fi

echo ""
read -p "Enter your Heroku app name (or press Enter to auto-generate): " APP_NAME

if [ -z "$APP_NAME" ]
then
    echo "Creating Heroku app with auto-generated name..."
    heroku create
else
    echo "Creating Heroku app: $APP_NAME"
    heroku create "$APP_NAME"
fi

echo ""
echo "======================================"
echo "  API Key Configuration"
echo "======================================"
echo ""
echo "You need at least ONE API key. You can set all three or just one."
echo ""

read -p "Do you have an OpenAI API key? (y/n): " HAS_OPENAI
if [ "$HAS_OPENAI" = "y" ] || [ "$HAS_OPENAI" = "Y" ]
then
    read -p "Enter your OpenAI API key: " OPENAI_KEY
    heroku config:set VITE_OPENAI_API_KEY="$OPENAI_KEY"
    echo "✅ OpenAI API key set"
fi

echo ""
read -p "Do you have an Anthropic API key? (y/n): " HAS_ANTHROPIC
if [ "$HAS_ANTHROPIC" = "y" ] || [ "$HAS_ANTHROPIC" = "Y" ]
then
    read -p "Enter your Anthropic API key: " ANTHROPIC_KEY
    heroku config:set VITE_ANTHROPIC_API_KEY="$ANTHROPIC_KEY"
    echo "✅ Anthropic API key set"
fi

echo ""
read -p "Do you have a Google AI API key? (y/n): " HAS_GOOGLE
if [ "$HAS_GOOGLE" = "y" ] || [ "$HAS_GOOGLE" = "Y" ]
then
    read -p "Enter your Google AI API key: " GOOGLE_KEY
    heroku config:set VITE_GOOGLE_AI_API_KEY="$GOOGLE_KEY"
    echo "✅ Google AI API key set"
fi

echo ""
echo "======================================"
echo "  Deploying to Heroku"
echo "======================================"
echo ""

# Add all files
git add .

# Commit
read -p "Enter commit message (default: 'Deploy to Heroku'): " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"Deploy to Heroku"}
git commit -m "$COMMIT_MSG"

# Push to Heroku
echo "Pushing to Heroku..."
git push heroku main || git push heroku master

echo ""
echo "======================================"
echo "  Deployment Complete!"
echo "======================================"
echo ""
echo "✅ Your app is deployed!"
echo ""
echo "Open your app:"
echo "  heroku open"
echo ""
echo "View logs:"
echo "  heroku logs --tail"
echo ""
echo "Check status:"
echo "  heroku ps"
echo ""
echo "View config:"
echo "  heroku config"
echo ""
