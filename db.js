require('dotenv').config()

const { Pool, Client } = require('pg')
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
})

module.exports = {
  create_table: (table, tableName, callback) => {
    if (table == "supervision_subscriptionids"){
      return pool.query(
        'CREATE TABLE IF NOT EXISTS ' + tableName + '(ext_id BIGINT PRIMARY KEY, sub_id VARCHAR(64) NOT NULL, tokens TEXT NOT NULL, device_id VARCHAR(32) NOT NULL)', callback);
    }
  },
  createIndex: (query, callback) => {
    return pool.query(query, callback);
  },
  delete_table:(query, callback) => {
    return pool.query(query, callback)
  },
  end_transaction: () => {
    pool.end();
  },
  insert_row: (query, values, callback) => {
    return pool.connect((err, client, done) => {
      const shouldAbort = (err) => {
        if (err) {
          console.error('Error in transaction', err.stack)
          client.query('ROLLBACK', (err) => {
            if (err) {
              console.error('Error rolling back client', err.stack)
            }
            // release the client back to the pool
            done()
          })
        }
        return !!err
      }
      client.query('BEGIN', (err) => {
        if (shouldAbort(err)) return
        client.query(query, values, (err, res) => {
          if (shouldAbort(err)) return
          client.query('COMMIT', (err) => {
            if (err) {
              console.error('Error committing transaction', err.stack)
            }
            done()
          })
        })
      })
    })
  },

  read: (query, callback) => {
    return pool.query(query, callback)
  },
  readAsync: async (query) => {
    let response;
    try {
      response = await pool.query(query);
      return response;
    } catch (error) {
      return null
    }
  },
  update: (query, callback) => {
    return pool.query(query, callback)
  },
  insert: (query, params, callback) => {
    return pool.query(query, params, callback)
  },
  remove:(query, callback) => {
    return pool.query(query, callback)
  },
}
