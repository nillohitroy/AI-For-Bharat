# 1. Use an official, lightweight Python image
FROM python:3.11-slim

# 2. Prevent Python from writing .pyc files and force output to terminal (good for AWS logs)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Set the working directory inside the container
WORKDIR /code

# 4. Copy ONLY the requirements file first (this caches dependencies so builds are incredibly fast)
COPY requirements.txt /code/

# 5. Install dependencies securely
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy your actual code (the app folder) into the container
COPY ./app /code/app

# 7. Tell AWS we are listening on port 8080
EXPOSE 8080

# 8. The foolproof Start Command
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]