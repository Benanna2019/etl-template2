const test = require('tape')
const index = require('./')

test('run job', async t => {
	const result = await index.handler()
  console.log(result)
	t.ok(true)
})
