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

CMD /bin/bash
