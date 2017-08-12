'use strict';

import jsonPointer from 'jsonpointer';
import clone from 'clone';

export const d$referencer = function(data, {cloneData = true} = {}) {
        let d$ = function ({$ref}) {
            let firstChar = $ref.substring(0, 1);
            if (firstChar !== '#') {
                throw new Error('The first character of the $ref string must be "#", nothing else has been implemented');
            }

            let pointer = $ref.substring(1);

            return jsonPointer.get(d$.data, pointer);
        };

        d$.data = cloneData ? clone(data) : data;

        d$.push = (entityName, newEntityData) => {
            let newEntityDataClone = {...newEntityData};

            let newEntityIndex = d$.data[entityName].push(newEntityDataClone) - 1;
            newEntityDataClone.d$self = {$ref : '#/' + entityName + '/' + newEntityIndex};

            return newEntityDataClone;
        };

        d$.add = (entityName, newEntityData) => {
            let newEntityDataClone = {...newEntityData};
            let { d$self } = newEntityData;

            d$.data[entityName][d$self] = newEntityDataClone;

            return 
        };

        return d$;
};
