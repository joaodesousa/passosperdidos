# Start from the official Python image
FROM python:3.11

# Set the working directory
WORKDIR /app

# Copy the project files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Run the application
CMD ["gunicorn", "-b", "0.0.0.0:8080", "myproject.wsgi:application"]
