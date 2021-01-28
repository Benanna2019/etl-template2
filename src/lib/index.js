const { Async } = require('crocks')
const { ifElse, compose, prop, merge, map } = require('ramda') 
const asyncFetch = Async.fromPromise(fetch)
const toJSON = res => Async.fromPromise(res.json.bind(res))() // await res.json() 


exports.extract = config => 
	Async.of(config)
    .chain(compose(asyncFetch, prop('source')))
    .chain(toJSON)
    .map(data => merge(config, { data: data }))

exports.transform = config => 
	Async.of(config)
    .map(prop('data'))
    .map(
			map(o => 
				merge(o, { runDate: new Date().toISOString() })
			)
		)
    .map(data => merge(config, { data }))

const postRecord = (target, token) => record => 
	// if check then put else post
	
	asyncFetch(target + '/data/etl-demo', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		},
		body: JSON.stringify(record)
	})
	.chain(toJSON)

exports.load = config => 
	Async.of(config)
    .chain(({ target, targetToken, data }) => 
			Async.all(
        map(postRecord(target, targetToken), data)
			)
		)





