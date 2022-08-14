#!/bin/sh

python3 db/reset.py
rm db/db.db
echo "Database reset"
python3 db/init.py
echo "Database initialized"