# syntax=docker/dockerfile:1

FROM python:3.7-alpine
WORKDIR /app
COPY . .
RUN pip install pipreqs
RUN pipreqs .
RUN pip install -r requirements.txt
RUN python db/init.py
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0"]