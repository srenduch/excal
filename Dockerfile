# syntax=docker/dockerfile:1

FROM python:3.7-alpine
WORKDIR /app
COPY . .
RUN pip install pipreqs
RUN pipreqs . >> requirements.txt & echo -e "gunicorn" >> requirements.txt
RUN pip install -r requirements.txt
RUN pip install gunicorn
RUN python db/init.py
CMD ["python", "src/app.py"]