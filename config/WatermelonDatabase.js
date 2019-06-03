import { Database, Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { appSchema, tableSchema } from '@nozbe/watermelondb'
import { identity } from 'rxjs';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'Job',
      columns: [
        { name: 'id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'payload', type: 'string' },
        { name: 'data', type: 'string' },
        { name: 'priority', type: 'string' },
        { name: 'timeout', type: 'number' },
        { name: 'created', type: 'string' },
        { name: 'failed', type: 'boolean', isOptional: true },
      ]
    })
  ]
});

export class Job extends Model {
    static table = 'Job';

    @field('id') id;
    @field('name') name;
    @field('payload') payload;
    @field('data') data;
    @field('priority') priority;
    @field('timeout') timeout;
    @date('created') created;
    @field('failed') failed;
}

export default class WatermelonDaterbase {

    constructor() {
        this.instance = null;
    }
    
    async init() {
        const adabper = new SQLiteAdapter({
            schema
        });
        this.instance = new Database({
            adapter,
            modelClasses: [
                Job
            ]
        });
    }

    read(name, options = {}) {
        let {filter, sort} = options;
        let result = this.instance.collections.get(name);
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
        let collection = this.instance.collections.get(name)
        collection.create((job)={}));
      }
    
      delete(entity) {
        this.instance.delete(entity);
      }
    
      deleteAll() {
        this.instance.deleteAll();
      }
    
      async transactional(callback) {
        this.instance.action(async () => {
          await callback();
        });
      }
}
