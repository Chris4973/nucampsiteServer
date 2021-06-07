const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite) {
            if(favorite.user.equals(req.user._id) && favorite.campsites.includes(req.body.campsiteId)) {
                return next();
            } 
        }
        Favorite.create({user: req.user._id, campsites: req.body.campsiteId})
        .then(newFavorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(newFavorite);
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete(req.body.user)
    .then(favorite => {
        if(favorite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.');
        }
    })
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        console.log(`POST to /favorites/:campsiteId initiated! favorite.campsites content: ${favorite.campsites}`);
        if(favorite.campsites.includes(req.params.campsiteId)) {
            res.end("That campsite is already in the list of favorites!");
        } else {
            favorite.campsites.push(req.params.campsiteId);
            favorite.save();
            res.end(`Campsite ID: ${req.params.campsiteId} has been added to the list of favorites!`);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        favorite.campsites.splice(favorite.campsites.indexOf(req.params.campsiteId), 1);
        favorite.save();
        res.end(`Campsite ID: ${req.params.campsiteId} have been deleted from the list of favorites!`);
    })
});

module.exports = favoriteRouter;