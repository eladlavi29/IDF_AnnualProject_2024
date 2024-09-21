import {getInputParams} from '../src/DjangoCommunication';

export default class Query {
    constructor(query, type) {
        this.query = query;
        this.type = type;
        this.index = -1;
        this.inputParams = NaN;
        if(query != '')
            this.inputParams = Array(getInputParams(query).length).fill();
    }
}
