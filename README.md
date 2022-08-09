yeah im kicking myself not using javascript but id rather suffer from flask's limitations before messing with ===

## how2build
```
pip install pipreqs
pipreqs --encoding=utf-8 .
pip install -r requirements.txt
python db/init.py
python app.py
```
or just build the image and run the container that does everything 4 u