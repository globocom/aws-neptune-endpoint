FROM python:3.10 as local
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . /app
EXPOSE 5000
CMD FLASK_ENV=development FLASK_APP=app/app flask run --host=0.0.0.0

FROM local as prod
CMD FLASK_APP=app/app flask run --host=0.0.0.0
