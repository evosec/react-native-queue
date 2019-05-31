/**
 * Realm database bootstrap
 */

import { RealmConfig } from './realmConfig';

const JobSchema = {
  name: 'Job',
  primaryKey: 'id',
  properties: {
    id:  'string', // UUID.
    name: 'string', // Job name to be matched with worker function.
    payload: 'string', // Job payload stored as JSON.
    data: 'string', // Store arbitrary data like "failed attempts" as JSON.
    priority: 'int', // -5 to 5 to indicate low to high priority.
    active: { type: 'bool', default: false}, // Whether or not job is currently being processed.
    timeout: 'int', // Job timeout in ms. 0 means no timeout.
    created: 'date', // Job creation timestamp.
    failed: 'date?' // Job failure timestamp (null until failure).
  }
};

export default class RealmDatabase {

  instance = null; // Use a singleton connection to realm for performance.

  Realm = null;

  async init(options = {}) {
    // Connect to realm if database singleton instance has not already been created.
    try {
      Realm = require('realm');
    } catch(e) {
      throw new Error('Realm could not be imorted')
    }
    
    if (this.instance === null) {
      this.instance = await Realm.open({
        path: options.realmPath || RealmConfig.REALM_PATH,
        schemaVersion: RealmConfig.REALM_SCHEMA_VERSION,
        schema: [JobSchema]
        // Look up shouldCompactOnLaunch to auto-vacuum https://github.com/realm/realm-js/pull/1209/files
      });
    }
    return this.instance;

  }

  read(name, options = {}) {
    let {filter, sort} = options;
    let result = this.instance.objects(name);
    if(filter && filter.sql) {
      result = result
        .filtered(filter.sql);
    }
    if(sort && sort.properties) {
      result = result
        .sorted(sort.properties);
    }
    return result;
  }

  write(name, entity) {
    this.instance.create(name, entity);
  }

  delete(entity) {
    this.instance.delete(entity);
  }

  deleteAll() {
    this.instance.deleteAll();
  }

  transactional(callback) {
    this.instance.write(() => {
      callback();
    });
  }

}
