import * as express from 'express';
// From entities
import * as CategoryRoute from './Category/CategoryRoute';
import * as BalanceRoute from './Balance/BalanceRoute';
import * as MovementRoute from './Movement/MovementRoute';
import * as EntryRoute from './Entry/EntryRoute';
import * as AccountRoute from './Account/AccountRoute';
import * as PlaceRoute from './Place/PlaceRoute';
import * as PresetRoute from './Preset/PresetRoute';

// Internal
import * as TypeGenerator from './TypeGenerator/TypeGeneratorRoute';

const router = express.Router();

// Routing from entities
router.use('/categories', CategoryRoute.router);
router.use('/balance', BalanceRoute.router);
router.use('/movements', MovementRoute.router);
router.use('/entries', EntryRoute.router);
router.use('/accounts', AccountRoute.router);
router.use('/places', PlaceRoute.router);
router.use('/presets', PresetRoute.router);

// Routing for internals
router.use('/type-generator', TypeGenerator.router);

export { router };