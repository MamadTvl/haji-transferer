###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18 As development
# Create app directory
WORKDIR /usr/src/app
ENV NODE_ENV DEVELOPMENT
# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package*.json ./
COPY --chown=node:node yarn.lock ./

RUN yarn

# Bundle app source
COPY --chown=node:node . .

# Use the vod user from the image (instead of the root user)
USER haji

###################
# BUILD FOR PRODUCTION
###################

FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY --chown=haji:haji package*.json ./

# In order to run `npm run build` we need access to the Nest CLI.
# The Nest CLI is a dev dependency,
# In the previous development stage we ran `npm ci` which installed all dependencies.
# So we can copy over the node_modules directory from the development image into this build image.
COPY --chown=haji:haji --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=haji:haji . .

# Set NODE_ENV environment variable
ENV NODE_ENV production
# Run the build command which creates the production bundle
# This ensures that the node_modules directory is as optimized as possible.
RUN yarn build && yarn install --production --ignore-scripts --prefer-offline
USER haji

###################
# PRODUCTION
###################

FROM node:18-alpine As production

# Copy the bundled code from the build stage to the production image
COPY --chown=haji:haji --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=haji:haji --from=build /usr/src/app/dist ./dist
COPY --chown=haji:haji --from=build /usr/src/app/package.json ./package.json

# Start the server using the production build
CMD ["node" ,"dist/main.js"] 