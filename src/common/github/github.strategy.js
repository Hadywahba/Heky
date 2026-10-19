

import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { GITHUB_CALLBACK_URL, GITHUB_CLIENT_IDS, GITHUB_CLIENT_SECRET } from "../../config.js";


passport.use(
    new GitHubStrategy(
        {
            clientID: GITHUB_CLIENT_IDS,
            clientSecret: GITHUB_CLIENT_SECRET,
            callbackURL: GITHUB_CALLBACK_URL,
        },
        (accessToken, refreshToken, profile, done) => {
            done(null, { accessToken, profile });
        }
    )
);

export default passport;