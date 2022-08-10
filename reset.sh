#!/bin/sh

python3 db/reset.py
echo "Database reset"
python3 db/init.py
echo "Database initialized"