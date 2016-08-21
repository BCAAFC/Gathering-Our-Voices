FROM hoverbear/archlinux
MAINTAINER Andrew Hobden <andrew@hoverbear.org>

# Install system dependencies
#   nodejs - Running the application
#   npm - Installing dependencies
#   python - For node-gyp/bcrypt
#   make - For node-gyp/bcrypt
#   gcc - For node-gyp/bcrypt
#   git - For installing deps.
#   jpegtran - For imagemin.
#   optipng - For imagemin.
RUN pacman -Syu --noconfirm nodejs npm python2 make gcc git optipng && \
  npm install -g grunt-cli

# Create a non-root user to use the application.
RUN useradd -m -b / app

# Install the application itself.
ADD . /app
RUN chown -R app:app /app

# Change into the user.
USER app

# All future commands will be done in this directory.
WORKDIR /app

# Install application dependencies.
# Remove the existing dir to avoid any platform headaches.
RUN rm -rf ./node_modules && \
  npm install && \
  ./node_modules/bower/bin/bower install && \
  grunt build

# Use the default configuration which is already Docker friendly.
RUN cp /app/config/config.example.js /app/config/config.js
RUN cp /app/config/database.example.js /app/config/database.js

# Web services get exposed on port 80 usually.
EXPOSE 8080

# Allows us to use Docker like an executable.
ENTRYPOINT [ "npm", "start" ]
