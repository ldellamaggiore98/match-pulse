#!/bin/sh
export PUPPETEER_EXECUTABLE_PATH=$(which chromium || which chromium-browser)
exec node backend/src/server.js
