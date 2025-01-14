const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const cityRoutes = require("./cityRoutes");
const breweryRoutes = require("./breweryRoutes");
const locationBreweryRoutes = require("./locationBreweryRoutes");
const beersRoutes = require("./beerRoutes");
const foodRoutes = require("./foodRoutes");
const musicRoutes = require("./musicRoutes");
const eventsRoutes = require("./eventRoutes");
const serviceRoutes = require("./serviceRoutes");
const tutorialStepsRoutes = require("./tutorialStepsRoutes");
const tagsRoutes = require("./tagsRoutes");
const tourRoutes = require("./tourRoutes");
const notificationsRoutes = require("./notificationRoutes");
const adTypeRoutes = require("./adTypeRoutes");
const adRatesRoutes = require("./adRatesRoutes");
const adRoutes = require("./adRoutes");
const categoryRoutes = require("./categoryRoutes");
const itemRoutes = require("./itemRoutes");
const appTermsRoutes = require("./appTermsRoutes");
const featuresRoutes = require("./featuresRoutes");
const mediaBreweryRoutes = require("./mediaBreweryRoutes");

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/states', cityRoutes);
router.use('/breweries', breweryRoutes);
router.use('/location-breweries', locationBreweryRoutes);
router.use('/beers', beersRoutes);
router.use('/foods', foodRoutes);
router.use('/musics', musicRoutes);
router.use('/events', eventsRoutes);
router.use('/services', serviceRoutes);
router.use('/tutorial-steps', tutorialStepsRoutes);
router.use('/tags', tagsRoutes);
router.use('/tours', tourRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/ad-types', adTypeRoutes);
router.use('/ad-rates', adRatesRoutes);
router.use('/ads', adRoutes);
router.use('/categories', categoryRoutes);
router.use('/items', itemRoutes);
router.use('/app-terms', appTermsRoutes);
router.use('/features', featuresRoutes);
router.use('/media-breweries', mediaBreweryRoutes);

module.exports = router;