globalThis.fetch = require('@vercel/fetch')(require('node-fetch'))

const { Async } = require('crocks')
const { extract, transform, load, report } = require('./lib')

// learn more about scheduled functions here: https://arc.codes/primitives/scheduled
exports.handler = async function scheduled (event) {
	const config = {
		source: process.env.SOURCE || 'http://localhost:3000',
		target: process.env.TARGET,
		targetToken: process.env.TARGET_TOKEN
	}

	return await Async.of(config)
	  .chain(extract)
		.chain(transform)
	  .chain(load)

	/*
	  .chain(report)
  */
		.toPromise()

  
}

