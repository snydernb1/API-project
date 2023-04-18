const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User, Spot } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

const setTokenCookie = (res, user) => {
    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
    };
    const token = jwt.sign(
        { data: safeUser },
        secret,
        { expiresIn: parseInt(expiresIn) } //604,800 seconds = 1 week
    );

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
        maxAge: expiresIn * 1000,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction && "Lax"
    });

    return token;
};


const restoreUser = (req, res, next) => {
    const { token } = req.cookies;
    req.user = null;

    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
        if (err) {
            return next();
        };

        try {
            const { id } = jwtPayload.data;
            req.user = await User.findByPk(id, {
                attributes: {
                    include: ['email', 'createdAt', 'updatedAt']
                }
            });
        } catch (err) {
            res.clearCookie('token');
            return next();
        }

        if (!req.user) res.clearCookie('token');

        return next();
    });
};


const requireAuth = function (req, res, next) {

    if (req.user) return next();

    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = { message: 'Authentication required'};
    err.status = 401;
    return next(err);
};


const reqSpotAuth = async function (req, res, next) {
    const spotId = req.params.spotId;
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
        const err = new Error();
        err.status = 404;
        err.message = "Spot couldn't be found";
        return next(err);
    }

    if (Number(req.user.id) === Number(spot.ownerId)) return next();

    const err = new Error('Authorization required');
    err.title = 'Authorization required';
    err.errors = { message: 'Forbidden'};
    err.status = 403;
    return next(err);
}


module.exports = {setTokenCookie, restoreUser, requireAuth, reqSpotAuth};
