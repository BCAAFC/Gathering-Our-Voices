'use strict';

/**
* Returns a nice set of convienence functions.
*/
module.exports = function () {
  /*
  * Definitely set these:
  */
  // Configure the secret used by cookies and sessions.
  check("SECRET", undefined);
  // The postgres database URL.
  // Ex. `postgres://localhost/gov`
  check("PG_URL",  undefined);
  // The redis URL.
  // Ex. `localhost`
  check("REDIS_URL", undefined);
  // A list of administrators, by email, comma seperated.
  // Ex. `andrew@hoverbear.org,root@hoverbear.org`
  check("ADMINS", null);
  // The Earlybird deadline for cheaper tickets.
  check("EARLYBIRD_DEADLINE", undefined);
  // This will error and exit the process if the deadline isn't properly set.
  if (isNaN(Date.parse(process.env.EARLYBIRD_DEADLINE)) === true) {
    console.warn("Error: EARLYBIRD_DEADLINE needs to be a date.")
    process.exit(1);
  }

  /*
  * These are third party helpers which the site uses.
  * Mailgun and Twilio are both great, high quality services with reasonable rates.
  */
  // The credentials for Mailgun.
  // Ex. `smtps://$EMAIL:$PASSWORD@smtp.mailgun.org`
  check("MAILGUN_CREDS", null);
  // Twilio Credentials. See your account page for these details.
  check("TWILIO_ACCOUNT_SID", null);
  check("TWILIO_AUTH_TOKEN", null);

  /*
  * These might be set different in deployment conditions.
  */
  // $NODE_ENV is a node.js specific variable that configures debugging levels.
  // Should be "development" or "production"
  check("NODE_ENV", "development");
  // Configure the port the site will bind to.
  check("PORT", 8080);
  // The directory image uploads will go.
  check("UPLOAD_DIR", "./uploads/");
  // The key used by the datasource API requests from Excel etc.
  // If not set it'll just be disabled.
  // You should set this with something like `encodeURIComponent(crypto.randomBytes(64).toString('base64'))`
  check("DATASOURCE_KEY", null);
};

/**
* Checks an `environment` value, if it does not exist falls back to `fallback`.
* Passing `undefined` to `fallback` makes the process fail if the value is not present
* in the environment.
*/
function check(variable, fallback) {
  if (process.env[variable] === undefined) {
    if (fallback === undefined) {
      console.warn("You must set $"+variable+". See \`src/env.js\` for help.")
      process.exit(1);
    }
    process.env[variable] = fallback;
    console.warn("$" + variable + " = (DEFAULT)", process.env[variable]);
  } else {
    console.log("$" + variable + " = ", process.env[variable]);
  }
}
