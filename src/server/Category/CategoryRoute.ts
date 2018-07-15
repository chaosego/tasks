import * as express from 'express';
import { iNode } from "../iNode";
import { CategoryServer } from './CategoryServer';

const router = express.Router();
/*

 */
router.get('/', (req, res) => {
    let server: CategoryServer = new CategoryServer();
    let node: iNode = {
        request: req
        , response: res
    };
    server.list(node);
});

export { router };