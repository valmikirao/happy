
class Store {
    constructor({data = {}, defaultKeyColumn = 'id'} = {}) {
        Object.assign(this, {data, defaultKeyColumn});
    }

    ref(entity, key) {
        if (key === undefined) {
            // let people call store.ref({myEntity}).get()

            [].each

            let arg1 = entity;
            entity = arg1.keys()[0];
            key = arg1[entity]
        }
        return new Reference({
            store : this,
            entity,
            key
        });
    }

    refNew({entity, value, key, keyColumn = this.defaultKeyColumn}) {
        if (this.data[entity] === undefined) {
            this.data[entity] = {};
        }

        if (key === undefined) {
            key = value[keyColumn]
        }

        this.data[entity][key] = value;

        return this.ref(entity, key);
    }
}

class Reference {
    constructor({store, entity, key}) {
        Object.assign(this, {store, entity, key});
    }

    get() {
        return this.store.data[this.entity][this.key];
    }

    set(value) {
        this.store.data[this.entity][this.key] = value;

        return this;
    }
}

class ReferenceArray {
    constructor({store, entity, keys = []}) {
        Object.assign(this, {store, entity, keys});
    }

    get(i) {
        return this.store.data[this.entity][this.keys[i]];
    }

    set(i, value) {
        this.store.data[this.entity][this.keys[i]] = value;

        return this;
    }

    getArray() {
        return keys.map((key) => this.get(i));
    }

    setArray(values) {
        values.each((value, i) => this.set(i, value))

        return this;
    }

    pushRefNew({entity, values = [], keyColumn = this.store.defaultKeyColumn}) {
        values.each((value) => {
            let refToPush = this.store.refNew({entity, value, keyColumn});

            this.keys.push(refToPush.key);
        })

        return this;
    }
}

export default Store;