const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favouriteRouter = express.Router();
favouriteRouter.use(bodyParser.json());

const mongoose = require('mongoose');
const Favourites = require('../models/favourite');


favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser,  (req, res, next) => {
    Favourites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
      .then((favourites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourites);
     }, (err) => next(err))
     .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({user: req.user._id})
     .then((favourite) => {
       if(favourite) {
         for(var i = 0; i < req.body.length; i++) {
           if(favourite.dishes.indexOf(req.body[i]._id) === -1) {
             favourite.dishes.push(req.body._id);
           }
         }
         favourite.save()
         .then((favourite) => {
                console.log('Favourite Dish Created: ', favourite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourite);
         }, (err) => next(err))
       }
       else {
        Favourites.create({'user': req.user._id, 'dishes': req.body})
        .then((favourite) => {
           console.log('Favourite Dish Created', favourite);
           res.statusCode = 200;
           res.setHeader('Content-Type', 'application/json');
           res.json(favourite);
        }, (err) => next(err))
      }
  }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported!');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
    Favourites.findOneAndRemove({'user': req.user._id})
    .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
   }, (err) => next(err))
    .catch((err) => next(err));
});

favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/' + req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({user: req.user._id})
    .then((favourite) => {
        if (favourite) {            
            if (favourite.dishes.indexOf(req.params.dishId) === -1) {
                favourite.dishes.push(req.params.dishId)
                favourite.save()
                .then((favourite) => {
                    console.log('Favorite Dish Created ', favourite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                }, (err) => next(err))
            }
        }
        else {
            Favourites.create({'user': req.user._id, 'dishes': [req.params.dishId]})
            .then((favourite) => {
                console.log('Favorite Dish Created ', favourite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourite);
            }, (err) => next(err))
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({user: req.user._id})
    .then((favourite) => {
        if (favourite) {            
            index = favourite.dishes.indexOf(req.params.dishId);
            if (index >= 0) {
                favourite.dishes.splice(index, 1);
                favourite.save()
                .then((favourite) => {
                    console.log('Favorite Deleted ', favourite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found!!!');
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('Favorites Dishes Not Found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favouriteRouter;